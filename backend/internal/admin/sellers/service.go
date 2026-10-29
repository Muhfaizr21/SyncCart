package sellers

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/Muhfaizr21/SyncCart/backend/config"
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"golang.org/x/crypto/bcrypt"
)

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
	SupportPhone     string `json:"support_phone"`
	TaxNPWP          string `json:"tax_npwp"`
	Plan             string `json:"plan"`
	BillingCycle     string `json:"billing_cycle"`
}

type UpdateSellerProfileInput struct {
	StoreName            string `json:"store_name"`
	OwnerFullName        string `json:"owner_full_name"`
	OwnerEmail           string `json:"owner_email"`
	BusinessCategory     string `json:"business_category"`
	WarehouseName        string `json:"warehouse_name"`
	WarehouseCity        string `json:"warehouse_city"`
	SupportPhone         string `json:"support_phone"`
	SupportEmail         string `json:"support_email"`
	TaxNPWP              string `json:"tax_npwp"`
	SafetyStockBuffer    int    `json:"safety_stock_buffer"`
	SyncIntervalMinutes  int    `json:"sync_interval_minutes"`
	Plan                 string `json:"plan"`
	BillingCycle         string `json:"billing_cycle"`
	Status               string `json:"status"`
}

type Service interface {
	ListEnrichedSellers() ([]SellerEnrichedDTO, error)
	CreateSeller(input CreateSellerInput) (*models.Store, error)
	UpdateSellerProfile(storeID uint, input UpdateSellerProfileInput) (*models.Store, error)
	UpdateSellerStatus(storeID uint, status string) (*models.Store, error)
	UpdateSellerPlan(storeID uint, plan string, cycle string) (*models.Store, error)
	SyncSellerProducts(storeID uint) (int, error)
	DeleteSeller(storeID uint) error
}

type sellerService struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &sellerService{repo: repo}
}

func (s *sellerService) logAction(storeID uint, actionType, status, msg string) {
	_ = s.repo.CreateSyncLog(&models.SyncLog{
		StoreID:           storeID,
		Platform:          "SuperAdmin • Sellers",
		ActionType:        actionType,
		Status:            status,
		ItemsSynced:       1,
		ConflictsResolved: 0,
		DurationMs:        36,
		Message:           msg,
		CreatedAt:         time.Now(),
	})
}

func (s *sellerService) ListEnrichedSellers() ([]SellerEnrichedDTO, error) {
	stores, err := s.repo.ListStores()
	if err != nil {
		return nil, err
	}
	users, _ := s.repo.ListUsers()
	products, _ := s.repo.ListProducts()
	orders, _ := s.repo.ListOrders()
	conns, _ := s.repo.ListConnections()

	userMap := make(map[uint]models.User, len(users))
	for _, u := range users {
		userMap[u.ID] = u
	}

	result := make([]SellerEnrichedDTO, 0, len(stores))
	for _, st := range stores {
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

		result = append(result, SellerEnrichedDTO{
			Store:           st,
			OwnerName:       owner.FullName,
			OwnerEmail:      owner.Email,
			ProductsCount:   pCount,
			OrdersCount:     oCount,
			TotalGMV:        gmv,
			ConnectedStores: cCount,
		})
	}
	return result, nil
}

func (s *sellerService) CreateSeller(input CreateSellerInput) (*models.Store, error) {
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
	if plan != "starter" && plan != "business" && plan != "enterprise" {
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
	phone := strings.TrimSpace(input.SupportPhone)
	if phone == "" {
		phone = "+62 812-8890-4412"
	}
	npwp := strings.TrimSpace(input.TaxNPWP)
	if npwp == "" {
		npwp = "09.254.294.3-042.000"
	}
	slug := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(input.StoreName), " ", "-"))

	newStore := &models.Store{
		OwnerID:             newUser.ID,
		StoreName:           strings.TrimSpace(input.StoreName),
		StoreSlug:           slug,
		BusinessCategory:    cat,
		WarehouseName:       "Gudang Utama " + strings.TrimSpace(input.StoreName),
		WarehouseCity:       city,
		SupportPhone:        phone,
		SupportEmail:        email,
		TaxNPWP:             npwp,
		Plan:                plan,
		BillingCycle:        cycle,
		SafetyStockBuffer:   3,
		SyncIntervalMinutes: 5,
		ConnectedChannels:   "Shopee,Tokopedia,TikTok Shop",
		Status:              "active",
	}
	if err := s.repo.CreateStore(newStore); err != nil {
		return nil, err
	}

	// Provision default Marketplace OAuth connections
	for _, mp := range []string{"Shopee", "Tokopedia", "TikTok Shop"} {
		_ = s.repo.CreateConnection(&models.MarketplaceConnection{
			StoreID:        newStore.ID,
			Platform:       mp,
			ShopName:       newStore.StoreName + " (" + mp + ")",
			Status:         "connected",
			ProductsSynced: 0,
		})
	}

	// Provision initial SaaS invoice
	baseAmt := int64(299000)
	planLabel := "Business"
	if plan == "enterprise" {
		baseAmt = 799000
		planLabel = "Enterprise"
	} else if plan == "starter" {
		baseAmt = 99000
		planLabel = "Starter"
	}
	taxAmt := (baseAmt * 11) / 100
	_ = s.repo.CreateInvoice(&models.SubscriptionInvoice{
		StoreID:        newStore.ID,
		InvoiceNumber:  fmt.Sprintf("INV-ADM-%d", time.Now().Unix()%90000+10000),
		PlanName:       planLabel,
		BillingCycle:   cycle,
		BaseAmount:     baseAmt,
		TaxAmount:      taxAmt,
		TotalAmount:    baseAmt + taxAmt,
		PaymentGateway: "Midtrans • BCA Virtual Account",
		AddonsSummary:  "Registrasi Toko Baru SuperAdmin",
		PeriodStart:    time.Now().Format("02 Jan 2006"),
		PeriodEnd:      time.Now().AddDate(0, 1, 0).Format("02 Jan 2006"),
		Status:         "Paid",
	})

	s.logAction(
		newStore.ID,
		"seller_created",
		"success",
		fmt.Sprintf("Toko baru %s (%s) berhasil didaftarkan beserta 3 koneksi OAuth marketplace", newStore.StoreName, strings.ToUpper(plan)),
	)
	return newStore, nil
}

func (s *sellerService) UpdateSellerProfile(storeID uint, input UpdateSellerProfileInput) (*models.Store, error) {
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

	// Update owner profile if provided
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

	s.logAction(
		st.ID,
		"seller_profile_updated",
		"success",
		fmt.Sprintf("Profil operasional & kuota toko %s diperbarui oleh SuperAdmin", st.StoreName),
	)
	return st, nil
}

func (s *sellerService) UpdateSellerStatus(storeID uint, status string) (*models.Store, error) {
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
	s.logAction(st.ID, "store_status_changed", "success", fmt.Sprintf("Status toko %s diubah ke %s", st.StoreName, strings.ToUpper(normalized)))
	return st, nil
}

func (s *sellerService) UpdateSellerPlan(storeID uint, plan string, cycle string) (*models.Store, error) {
	st, err := s.repo.FindStoreByID(storeID)
	if err != nil {
		return nil, err
	}
	cleanPlan := strings.ToLower(strings.TrimSpace(plan))
	if cleanPlan != "starter" && cleanPlan != "business" && cleanPlan != "enterprise" {
		cleanPlan = "business"
	}
	st.Plan = cleanPlan
	if strings.TrimSpace(cycle) != "" {
		st.BillingCycle = strings.ToLower(strings.TrimSpace(cycle))
	}
	if err := s.repo.SaveStore(st); err != nil {
		return nil, err
	}
	s.logAction(st.ID, "store_plan_updated", "success", fmt.Sprintf("Paket toko %s diubah ke %s (%s)", st.StoreName, strings.ToUpper(st.Plan), st.BillingCycle))
	return st, nil
}

func (s *sellerService) SyncSellerProducts(storeID uint) (int, error) {
	st, err := s.repo.FindStoreByID(storeID)
	if err != nil {
		return 0, err
	}
	count, err := s.repo.SyncStoreProducts(storeID)
	if err != nil {
		return 0, err
	}
	s.logAction(st.ID, "seller_catalog_synced", "success", fmt.Sprintf("Sinkronisasi paksa %d SKU toko %s ke 3 marketplace berhasil", count, st.StoreName))
	return count, nil
}

func (s *sellerService) DeleteSeller(storeID uint) error {
	st, err := s.repo.FindStoreByID(storeID)
	if err != nil {
		return err
	}
	if err := s.repo.DeleteStoreCascade(storeID); err != nil {
		return err
	}
	s.logAction(1, "store_deleted", "warning", fmt.Sprintf("Toko %s telah dihapus dari platform", st.StoreName))
	return nil
}
