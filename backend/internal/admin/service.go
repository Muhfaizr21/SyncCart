package admin

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/Muhfaizr21/SyncCart/backend/config"
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"golang.org/x/crypto/bcrypt"
)

// SellerEnrichedDTO combines a Store with its owner identity and live telemetry.
type SellerEnrichedDTO struct {
	models.Store
	OwnerName       string `json:"owner_name"`
	OwnerEmail      string `json:"owner_email"`
	ProductsCount   int    `json:"products_count"`
	OrdersCount     int    `json:"orders_count"`
	TotalGMV        int64  `json:"total_gmv"`
	ConnectedStores int    `json:"connected_stores"`
}

type CreateSellerInput struct {
	FullName         string `json:"full_name" binding:"required"`
	Email            string `json:"email" binding:"required"`
	Password         string `json:"password"`
	StoreName        string `json:"store_name" binding:"required"`
	BusinessCategory string `json:"business_category"`
	WarehouseCity    string `json:"warehouse_city"`
	Plan             string `json:"plan"`
	BillingCycle     string `json:"billing_cycle"`
}

type UpdateSellerProfileInput struct {
	StoreName           string `json:"store_name"`
	OwnerFullName       string `json:"owner_full_name"`
	OwnerEmail          string `json:"owner_email"`
	BusinessCategory    string `json:"business_category"`
	WarehouseName       string `json:"warehouse_name"`
	WarehouseCity       string `json:"warehouse_city"`
	SupportPhone        string `json:"support_phone"`
	SupportEmail        string `json:"support_email"`
	TaxNPWP             string `json:"tax_npwp"`
	SafetyStockBuffer   int    `json:"safety_stock_buffer"`
	SyncIntervalMinutes int    `json:"sync_interval_minutes"`
	Plan                string `json:"plan"`
	BillingCycle        string `json:"billing_cycle"`
	Status              string `json:"status"`
}

type BulkAdminActionInput struct {
	EntityType string `json:"entity_type"` // "sellers", "orders", "products"
	TargetType string `json:"target_type"` // alias for entity_type
	Action     string `json:"action" binding:"required"`
	IDs        []uint `json:"ids" binding:"required"`
}

type CouponInput struct {
	Code            string `json:"code" binding:"required"`
	Description     string `json:"description"`
	DiscountPercent int    `json:"discount_percent"`
	MaxUses         int    `json:"max_uses"`
	ApplicablePlans string `json:"applicable_plans"`
	ExpiresAt       string `json:"expires_at"`
}

// Service defines the business-logic contract for SuperAdmin operations (SOLID).
type Service interface {
	GetPlatformOverview() (map[string]any, error)
	CreateSellerAndStore(input CreateSellerInput) (*models.Store, error)
	UpdateSellerProfile(storeID uint, input UpdateSellerProfileInput) (*models.Store, error)
	UpdateSellerStatus(storeID uint, status string) (*models.Store, error)
	UpdateSellerPlan(storeID uint, plan string, cycle string) (*models.Store, error)
	SyncSellerProducts(storeID uint) (int, error)
	DeleteSellerStore(storeID uint) error
	ExecuteBulkAction(input BulkAdminActionInput) (int, error)
	UpdateUserRoleOrStatus(userID uint, role string, status string) (*models.User, error)
	CreatePlatformCoupon(input CouponInput) (*models.PlatformCoupon, error)
	DeletePlatformCoupon(couponID uint) error
	UpdatePlatformSettings(input models.PlatformSetting) (*models.PlatformSetting, error)
}

type adminService struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &adminService{repo: repo}
}

func (s *adminService) recordAdminLog(storeID uint, platform, actionType, status, msg string) {
	_ = s.repo.CreateSyncLog(&models.SyncLog{
		StoreID:           storeID,
		Platform:          platform,
		ActionType:        actionType,
		Status:            status,
		ItemsSynced:       1,
		ConflictsResolved: 0,
		DurationMs:        38,
		Message:           msg,
		CreatedAt:         time.Now(),
	})
}

func (s *adminService) GetPlatformOverview() (map[string]any, error) {
	users, err := s.repo.ListAllUsers()
	if err != nil {
		return nil, err
	}
	stores, err := s.repo.ListAllStores()
	if err != nil {
		return nil, err
	}
	products, err := s.repo.ListAllProducts()
	if err != nil {
		return nil, err
	}
	orders, err := s.repo.ListAllOrders()
	if err != nil {
		return nil, err
	}
	conns, err := s.repo.ListAllMarketplaceConnections()
	if err != nil {
		return nil, err
	}
	invoices, err := s.repo.ListAllInvoices()
	if err != nil {
		return nil, err
	}
	logs, err := s.repo.ListRecentSyncLogs(30)
	if err != nil {
		return nil, err
	}
	coupons, err := s.repo.ListAllCoupons()
	if err != nil {
		return nil, err
	}
	settings, _ := s.repo.GetPlatformSettings()

	userMap := make(map[uint]models.User, len(users))
	for _, u := range users {
		userMap[u.ID] = u
	}

	storeMap := make(map[uint]models.Store, len(stores))
	for _, st := range stores {
		storeMap[st.ID] = st
	}

	// Enrich sellers with aggregated metrics
	enrichedSellers := make([]SellerEnrichedDTO, 0, len(stores))
	var activeStoresCount int
	var suspendedStoresCount int

	for _, st := range stores {
		if st.Status == "suspended" {
			suspendedStoresCount++
		} else {
			activeStoresCount++
		}
		owner := userMap[st.OwnerID]
		var pCount, oCount, cCount int
		var gmv int64

		for _, p := range products {
			if p.StoreID == st.ID {
				pCount++
			}
		}
		for _, o := range orders {
			if o.StoreID == st.ID {
				oCount++
				if o.Status != "Cancelled" {
					gmv += o.Amount
				}
			}
		}
		for _, c := range conns {
			if c.StoreID == st.ID && c.Status == "connected" {
				cCount++
			}
		}
		if cCount == 0 && st.ConnectedChannels != "" {
			cCount = len(strings.Split(st.ConnectedChannels, ","))
		}

		enrichedSellers = append(enrichedSellers, SellerEnrichedDTO{
			Store:           st,
			OwnerName:       owner.FullName,
			OwnerEmail:      owner.Email,
			ProductsCount:   pCount,
			OrdersCount:     oCount,
			TotalGMV:        gmv,
			ConnectedStores: cCount,
		})
	}

	var totalGMV int64
	var paidOrdersCount, pendingOrdersCount, cancelledOrdersCount, shippedOrdersCount int
	var totalItemsOrdered int

	for _, o := range orders {
		totalItemsOrdered += o.Quantity
		switch o.Status {
		case "Cancelled":
			cancelledOrdersCount++
		case "Pending", "Perlu Resi":
			pendingOrdersCount++
			totalGMV += o.Amount
		case "Shipped":
			shippedOrdersCount++
			paidOrdersCount++
			totalGMV += o.Amount
		default:
			paidOrdersCount++
			totalGMV += o.Amount
		}
	}

	var totalSubscriptionRevenue int64
	for _, inv := range invoices {
		if inv.Status == "Paid" {
			totalSubscriptionRevenue += inv.TotalAmount
		}
	}

	var conflictProductsCount int
	for _, p := range products {
		if p.SyncStatus == "conflict" || p.Stock <= 10 {
			conflictProductsCount++
		}
	}

	totalOrders := len(orders)
	var avgOrderValue int64
	if totalOrders > 0 {
		avgOrderValue = totalGMV / int64(totalOrders)
	}
	avgItemsPerOrder := 1.0
	if totalOrders > 0 {
		avgItemsPerOrder = float64(totalItemsOrdered) / float64(totalOrders)
	}

	return map[string]any{
		"sellers":           enrichedSellers,
		"users":             users,
		"products":          products,
		"orders":            orders,
		"marketplaces":      conns,
		"invoices":          invoices,
		"sync_logs":         logs,
		"coupons":           coupons,
		"platform_settings": settings,
		"summary": map[string]any{
			"total_sellers":              len(stores),
			"active_sellers":             activeStoresCount,
			"suspended_sellers":          suspendedStoresCount,
			"total_users":                len(users),
			"total_products":             len(products),
			"conflict_products":          conflictProductsCount,
			"total_orders":               totalOrders,
			"paid_orders":                paidOrdersCount,
			"shipped_orders":             shippedOrdersCount,
			"pending_orders":             pendingOrdersCount,
			"cancelled_orders":           cancelledOrdersCount,
			"total_gmv":                  totalGMV,
			"total_subscription_revenue": totalSubscriptionRevenue,
			"avg_order_value":            avgOrderValue,
			"avg_items_per_order":        avgItemsPerOrder,
		},
	}, nil
}

func (s *adminService) CreateSellerAndStore(input CreateSellerInput) (*models.Store, error) {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	pass := strings.TrimSpace(input.Password)
	if pass == "" {
		pass = "Password123!"
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(pass), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	newUser := &models.User{
		FullName:     strings.TrimSpace(input.FullName),
		Email:        email,
		PasswordHash: string(hash),
		Role:         config.RoleSeller,
		Status:       "active",
	}
	if err := s.repo.CreateUser(newUser); err != nil {
		return nil, errors.New("email seller sudah digunakan atau gagal membuat akun")
	}

	plan := strings.ToLower(strings.TrimSpace(input.Plan))
	if plan == "" {
		plan = "business"
	}
	cycle := strings.ToLower(strings.TrimSpace(input.BillingCycle))
	if cycle != "annual" {
		cycle = "monthly"
	}
	cat := strings.TrimSpace(input.BusinessCategory)
	if cat == "" {
		cat = "Fashion & Apparel Omnichannel"
	}
	city := strings.TrimSpace(input.WarehouseCity)
	if city == "" {
		city = "Jakarta Selatan, DKI Jakarta"
	}
	slug := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(input.StoreName), " ", "-"))

	newStore := &models.Store{
		OwnerID:           newUser.ID,
		StoreName:         strings.TrimSpace(input.StoreName),
		StoreSlug:         slug,
		BusinessCategory:  cat,
		WarehouseCity:     city,
		Plan:              plan,
		BillingCycle:      cycle,
		ConnectedChannels: "Shopee,Tokopedia,TikTok Shop",
		Status:            "active",
	}
	if err := s.repo.CreateStore(newStore); err != nil {
		return nil, err
	}

	s.recordAdminLog(
		newStore.ID,
		"SuperAdmin",
		"seller_created",
		"success",
		fmt.Sprintf("Toko baru %s (%s) berhasil didaftarkan oleh SuperAdmin", newStore.StoreName, strings.ToUpper(plan)),
	)
	return newStore, nil
}

func (s *adminService) UpdateSellerProfile(storeID uint, input UpdateSellerProfileInput) (*models.Store, error) {
	st, err := s.repo.FindStoreByID(storeID)
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(input.StoreName) != "" {
		st.StoreName = strings.TrimSpace(input.StoreName)
		st.StoreSlug = strings.ToLower(strings.ReplaceAll(st.StoreName, " ", "-"))
	}
	if strings.TrimSpace(input.BusinessCategory) != "" {
		st.BusinessCategory = strings.TrimSpace(input.BusinessCategory)
	}
	if strings.TrimSpace(input.WarehouseName) != "" {
		st.WarehouseName = strings.TrimSpace(input.WarehouseName)
	}
	if strings.TrimSpace(input.WarehouseCity) != "" {
		st.WarehouseCity = strings.TrimSpace(input.WarehouseCity)
	}
	if strings.TrimSpace(input.SupportPhone) != "" {
		st.SupportPhone = strings.TrimSpace(input.SupportPhone)
	}
	if strings.TrimSpace(input.SupportEmail) != "" {
		st.SupportEmail = strings.TrimSpace(input.SupportEmail)
	}
	if strings.TrimSpace(input.TaxNPWP) != "" {
		st.TaxNPWP = strings.TrimSpace(input.TaxNPWP)
	}
	if input.SafetyStockBuffer >= 0 {
		st.SafetyStockBuffer = input.SafetyStockBuffer
	}
	if input.SyncIntervalMinutes > 0 {
		st.SyncIntervalMinutes = input.SyncIntervalMinutes
	}
	if strings.TrimSpace(input.Plan) != "" {
		st.Plan = strings.ToLower(strings.TrimSpace(input.Plan))
	}
	if strings.TrimSpace(input.BillingCycle) != "" {
		st.BillingCycle = strings.ToLower(strings.TrimSpace(input.BillingCycle))
	}
	if strings.TrimSpace(input.Status) != "" {
		st.Status = strings.ToLower(strings.TrimSpace(input.Status))
	}
	if err := s.repo.SaveStore(st); err != nil {
		return nil, err
	}
	if strings.TrimSpace(input.OwnerFullName) != "" || strings.TrimSpace(input.OwnerEmail) != "" {
		if owner, err := s.repo.FindUserByID(st.OwnerID); err == nil {
			if strings.TrimSpace(input.OwnerFullName) != "" {
				owner.FullName = strings.TrimSpace(input.OwnerFullName)
			}
			if strings.TrimSpace(input.OwnerEmail) != "" {
				owner.Email = strings.ToLower(strings.TrimSpace(input.OwnerEmail))
			}
			_ = s.repo.SaveUser(owner)
		}
	}
	s.recordAdminLog(
		st.ID,
		"SuperAdmin",
		"seller_profile_updated",
		"success",
		fmt.Sprintf("Profil operasional & kuota toko %s diperbarui oleh SuperAdmin", st.StoreName),
	)
	return st, nil
}

func (s *adminService) SyncSellerProducts(storeID uint) (int, error) {
	st, err := s.repo.FindStoreByID(storeID)
	if err != nil {
		return 0, err
	}
	products, err := s.repo.ListAllProducts()
	if err != nil {
		return 0, err
	}
	count := 0
	for i := range products {
		if products[i].StoreID == storeID {
			p := products[i]
			p.ShopeeStock = p.Stock
			p.TokopediaStock = p.Stock
			p.TikTokStock = p.Stock
			p.SyncStatus = "synced"
			p.LastSyncAt = time.Now()
			_ = s.repo.SaveProduct(&p)
			count++
		}
	}
	s.recordAdminLog(
		st.ID,
		"SuperAdmin",
		"seller_catalog_synced",
		"success",
		fmt.Sprintf("Sinkronisasi paksa %d SKU toko %s ke 3 marketplace berhasil", count, st.StoreName),
	)
	return count, nil
}

func (s *adminService) UpdateSellerStatus(storeID uint, status string) (*models.Store, error) {
	st, err := s.repo.FindStoreByID(storeID)
	if err != nil {
		return nil, err
	}
	normalized := strings.ToLower(strings.TrimSpace(status))
	if normalized != "suspended" {
		normalized = "active"
	}
	st.Status = normalized
	if err := s.repo.SaveStore(st); err != nil {
		return nil, err
	}

	s.recordAdminLog(
		st.ID,
		"SuperAdmin",
		"store_status_changed",
		"success",
		fmt.Sprintf("Status operasional toko %s diubah menjadi %s", st.StoreName, strings.ToUpper(normalized)),
	)
	return st, nil
}

func (s *adminService) UpdateSellerPlan(storeID uint, plan string, cycle string) (*models.Store, error) {
	st, err := s.repo.FindStoreByID(storeID)
	if err != nil {
		return nil, err
	}
	cleanPlan := strings.ToLower(strings.TrimSpace(plan))
	if cleanPlan != "free" && cleanPlan != "starter" && cleanPlan != "business" && cleanPlan != "enterprise" {
		cleanPlan = "business"
	}
	st.Plan = cleanPlan
	if strings.TrimSpace(cycle) != "" {
		st.BillingCycle = strings.ToLower(strings.TrimSpace(cycle))
	}
	if err := s.repo.SaveStore(st); err != nil {
		return nil, err
	}

	s.recordAdminLog(
		st.ID,
		"SuperAdmin",
		"store_plan_updated",
		"success",
		fmt.Sprintf("Paket langganan toko %s diubah ke %s (%s) oleh SuperAdmin", st.StoreName, strings.ToUpper(st.Plan), st.BillingCycle),
	)
	return st, nil
}

func (s *adminService) DeleteSellerStore(storeID uint) error {
	st, err := s.repo.FindStoreByID(storeID)
	if err != nil {
		return err
	}
	if err := s.repo.DeleteStoreCascade(storeID); err != nil {
		return err
	}
	s.recordAdminLog(1, "SuperAdmin", "store_deleted", "warning", fmt.Sprintf("Toko %s telah dihapus dari platform", st.StoreName))
	return nil
}

func (s *adminService) ExecuteBulkAction(input BulkAdminActionInput) (int, error) {
	affected := 0
	entity := strings.ToLower(strings.TrimSpace(input.EntityType))
	if entity == "" {
		entity = strings.ToLower(strings.TrimSpace(input.TargetType))
	}
	action := strings.ToLower(strings.TrimSpace(input.Action))

	switch entity {
	case "sellers":
		for _, id := range input.IDs {
			st, err := s.repo.FindStoreByID(id)
			if err != nil {
				continue
			}
			switch action {
			case "suspend":
				st.Status = "suspended"
				_ = s.repo.SaveStore(st)
			case "activate":
				st.Status = "active"
				_ = s.repo.SaveStore(st)
			case "upgrade_enterprise":
				st.Plan = "enterprise"
				_ = s.repo.SaveStore(st)
			case "upgrade_business":
				st.Plan = "business"
				_ = s.repo.SaveStore(st)
			case "delete":
				_ = s.repo.DeleteStoreCascade(st.ID)
			}
			affected++
		}
	case "orders":
		for _, id := range input.IDs {
			ord, err := s.repo.FindOrderByID(id)
			if err != nil {
				continue
			}
			switch action {
			case "mark_shipped":
				ord.Status = "Shipped"
				if ord.TrackingResi == "" {
					ord.TrackingResi = fmt.Sprintf("ADM-AWB-%d", (time.Now().Unix()%89999)+10000)
				}
			case "mark_completed":
				ord.Status = "Completed"
			case "cancel":
				ord.Status = "Cancelled"
			}
			_ = s.repo.SaveOrder(ord)
			affected++
		}
	case "products":
		for _, id := range input.IDs {
			prod, err := s.repo.FindProductByID(id)
			if err != nil {
				continue
			}
			switch action {
			case "force_sync", "resolve_conflict":
				prod.ShopeeStock = prod.Stock
				prod.TokopediaStock = prod.Stock
				prod.TikTokStock = prod.Stock
				prod.SyncStatus = "synced"
				prod.LastSyncAt = time.Now()
				_ = s.repo.SaveProduct(prod)
			case "delete":
				_ = s.repo.DeleteProduct(prod.ID)
			}
			affected++
		}
	}

	s.recordAdminLog(
		1,
		"SuperAdmin",
		"bulk_action",
		"success",
		fmt.Sprintf("Aksi massal '%s' pada %d %s berhasil dieksekusi", action, affected, entity),
	)
	return affected, nil
}

func (s *adminService) UpdateUserRoleOrStatus(userID uint, role string, status string) (*models.User, error) {
	u, err := s.repo.FindUserByID(userID)
	if err != nil {
		return nil, err
	}
	if strings.TrimSpace(role) != "" {
		u.Role = strings.ToLower(strings.TrimSpace(role))
	}
	if strings.TrimSpace(status) != "" {
		u.Status = strings.ToLower(strings.TrimSpace(status))
	}
	if err := s.repo.SaveUser(u); err != nil {
		return nil, err
	}
	s.recordAdminLog(1, "SuperAdmin", "user_updated", "success", fmt.Sprintf("Akun %s diperbarui (Role: %s, Status: %s)", u.Email, u.Role, u.Status))
	return u, nil
}

func (s *adminService) CreatePlatformCoupon(input CouponInput) (*models.PlatformCoupon, error) {
	code := strings.ToUpper(strings.TrimSpace(input.Code))
	if code == "" {
		return nil, errors.New("kode kupon tidak boleh kosong")
	}
	pct := input.DiscountPercent
	if pct <= 0 || pct > 80 {
		pct = 10
	}
	maxUses := input.MaxUses
	if maxUses <= 0 {
		maxUses = 100
	}
	plans := strings.TrimSpace(input.ApplicablePlans)
	if plans == "" {
		plans = "starter,business,enterprise"
	}
	exp := strings.TrimSpace(input.ExpiresAt)
	if exp == "" {
		exp = "31 Des 2026"
	}

	coupon := &models.PlatformCoupon{
		Code:            code,
		Description:     strings.TrimSpace(input.Description),
		DiscountPercent: pct,
		MaxUses:         maxUses,
		UsedCount:       0,
		ApplicablePlans: plans,
		ExpiresAt:       exp,
		Status:          "active",
	}
	if err := s.repo.CreateCoupon(coupon); err != nil {
		return nil, errors.New("kode kupon sudah terdaftar")
	}
	s.recordAdminLog(1, "SuperAdmin", "coupon_created", "success", fmt.Sprintf("Kupon promo platform %s (Diskon %d%%) diterbitkan", code, pct))
	return coupon, nil
}

func (s *adminService) DeletePlatformCoupon(couponID uint) error {
	return s.repo.DeleteCoupon(couponID)
}

func (s *adminService) UpdatePlatformSettings(input models.PlatformSetting) (*models.PlatformSetting, error) {
	cfg, err := s.repo.GetPlatformSettings()
	if err != nil {
		cfg = &models.PlatformSetting{}
	}
	if strings.TrimSpace(input.PlatformName) != "" {
		cfg.PlatformName = strings.TrimSpace(input.PlatformName)
	}
	if strings.TrimSpace(input.SupportEmail) != "" {
		cfg.SupportEmail = strings.TrimSpace(input.SupportEmail)
	}
	if strings.TrimSpace(input.SupportPhone) != "" {
		cfg.SupportPhone = strings.TrimSpace(input.SupportPhone)
	}
	if strings.TrimSpace(input.OfficeAddress) != "" {
		cfg.OfficeAddress = strings.TrimSpace(input.OfficeAddress)
	}
	if strings.TrimSpace(input.ShopeePartnerID) != "" {
		cfg.ShopeePartnerID = strings.TrimSpace(input.ShopeePartnerID)
	}
	if input.ShopeeRateLimitPerMin > 0 {
		cfg.ShopeeRateLimitPerMin = input.ShopeeRateLimitPerMin
	}
	if strings.TrimSpace(input.TokopediaAppID) != "" {
		cfg.TokopediaAppID = strings.TrimSpace(input.TokopediaAppID)
	}
	if input.TokopediaRateLimitPerMin > 0 {
		cfg.TokopediaRateLimitPerMin = input.TokopediaRateLimitPerMin
	}
	if strings.TrimSpace(input.TikTokAppKey) != "" {
		cfg.TikTokAppKey = strings.TrimSpace(input.TikTokAppKey)
	}
	if input.TikTokRateLimitPerMin > 0 {
		cfg.TikTokRateLimitPerMin = input.TikTokRateLimitPerMin
	}
	if input.CommissionStarterPct >= 0 {
		cfg.CommissionStarterPct = input.CommissionStarterPct
	}
	if input.CommissionBusinessPct >= 0 {
		cfg.CommissionBusinessPct = input.CommissionBusinessPct
	}
	if input.CommissionEnterprisePct >= 0 {
		cfg.CommissionEnterprisePct = input.CommissionEnterprisePct
	}
	cfg.MaintenanceMode = input.MaintenanceMode
	if input.AutoSuspendUnpaidDays > 0 {
		cfg.AutoSuspendUnpaidDays = input.AutoSuspendUnpaidDays
	}

	if err := s.repo.SavePlatformSettings(cfg); err != nil {
		return nil, err
	}
	s.recordAdminLog(1, "SuperAdmin", "platform_settings_updated", "success", "Konfigurasi global platform & rate limit API diperbarui")
	return cfg, nil
}
