package marketplace

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/Muhfaizr21/SyncCart/backend/internal/common"
	"github.com/Muhfaizr21/SyncCart/backend/internal/store"
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{db: db}
}

func (h *Handler) GetMarketplaceData(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	marketplaces, err := store.RecomputeMarketplaceStats(h.db, st.ID)
	if err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menghitung metrik marketplace", err.Error())
		return
	}

	var syncLogs []models.SyncLog
	h.db.Where("store_id = ?", st.ID).Order("id DESC").Limit(30).Find(&syncLogs)

	common.JSONSuccess(c, http.StatusOK, "Data integrasi marketplace berhasil dimuat dari PostgreSQL", gin.H{
		"marketplaces": marketplaces,
		"sync_logs":    syncLogs,
	})
}

type ConnectMarketplaceRequest struct {
	ShopName            string  `json:"shop_name"`
	ShopExternalID      string  `json:"shop_external_id"`
	AuthCode            string  `json:"auth_code"`
	SyncIntervalMinutes int     `json:"sync_interval_minutes"`
	PriceMarkupPct      float64 `json:"price_markup_pct"`
}

func (h *Handler) ConnectMarketplace(c *gin.Context) {
	mpID := c.Param("id")
	var mp models.MarketplaceConnection
	if err := h.db.First(&mp, mpID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Marketplace tidak ditemukan", err.Error())
		return
	}

	var req ConnectMarketplaceRequest
	_ = c.ShouldBindJSON(&req)

	if strings.TrimSpace(req.ShopName) != "" {
		mp.ShopName = strings.TrimSpace(req.ShopName)
	}
	if strings.TrimSpace(req.ShopExternalID) != "" {
		mp.ShopExternalID = strings.ToUpper(strings.TrimSpace(req.ShopExternalID))
	}
	if req.SyncIntervalMinutes > 0 {
		mp.SyncIntervalMinutes = req.SyncIntervalMinutes
	}

	authSuffix := strings.TrimSpace(req.AuthCode)
	if authSuffix == "" {
		authSuffix = fmt.Sprintf("%x", time.Now().UnixNano()%1000000)
	}

	mp.Status = "connected"
	mp.EncryptedToken = fmt.Sprintf("aes256:%s_oauth_%s", mp.PlatformSlug, authSuffix)
	mp.TokenExpiryDays = 30
	mp.LastError = ""
	mp.LastSyncAt = time.Now()
	mp.AutoSync = true
	mp.WebhookEnabled = true

	if err := h.db.Save(&mp).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menyimpan koneksi OAuth marketplace", err.Error())
		return
	}

	var products []models.Product
	h.db.Where("store_id = ?", mp.StoreID).Find(&products)
	for i := range products {
		switch mp.PlatformSlug {
		case "shopee":
			products[i].ShopeeStock = products[i].Stock
		case "tokopedia":
			products[i].TokopediaStock = products[i].Stock
		case "tiktok":
			products[i].TikTokStock = products[i].Stock
		}
		if products[i].ShopeeStock == products[i].Stock &&
			products[i].TokopediaStock == products[i].Stock &&
			products[i].TikTokStock == products[i].Stock {
			products[i].SyncStatus = "synced"
		}
		h.db.Save(&products[i])
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, mp.StoreID)
	store.RecordSyncLog(
		h.db,
		mp.StoreID,
		mp.Platform,
		"oauth_connect",
		"success",
		len(products),
		0,
		fmt.Sprintf("OAuth 2.0 %s (%s) berhasil terhubung & %d SKU disinkronkan", mp.Platform, mp.ShopName, len(products)),
	)

	common.JSONSuccess(c, http.StatusOK, fmt.Sprintf("%s berhasil dihubungkan via OAuth 2.0", mp.Platform), mp)
}

func (h *Handler) DisconnectMarketplace(c *gin.Context) {
	mpID := c.Param("id")
	var mp models.MarketplaceConnection
	if err := h.db.First(&mp, mpID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Marketplace tidak ditemukan", err.Error())
		return
	}

	mp.Status = "disconnected"
	mp.AutoSync = false
	mp.EncryptedToken = ""
	if err := h.db.Save(&mp).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memutuskan koneksi marketplace", err.Error())
		return
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, mp.StoreID)
	store.RecordSyncLog(
		h.db,
		mp.StoreID,
		mp.Platform,
		"oauth_disconnect",
		"warning",
		0,
		0,
		fmt.Sprintf("Koneksi OAuth 2.0 %s (%s) diputuskan oleh seller", mp.Platform, mp.ShopName),
	)

	common.JSONSuccess(c, http.StatusOK, fmt.Sprintf("Koneksi %s berhasil diputuskan", mp.Platform), mp)
}

func (h *Handler) SyncSingleMarketplace(c *gin.Context) {
	mpID := c.Param("id")
	var mp models.MarketplaceConnection
	if err := h.db.First(&mp, mpID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Marketplace tidak ditemukan", err.Error())
		return
	}

	if mp.Status != "connected" {
		common.JSONError(c, http.StatusBadRequest, fmt.Sprintf("%s sedang terputus. Hubungkan OAuth 2.0 terlebih dahulu.", mp.Platform), "marketplace_disconnected")
		return
	}

	var products []models.Product
	h.db.Where("store_id = ?", mp.StoreID).Find(&products)

	now := time.Now()
	conflictsFixed := 0

	for i := range products {
		p := &products[i]
		switch mp.PlatformSlug {
		case "shopee":
			if p.ShopeeStock != p.Stock {
				conflictsFixed++
			}
			p.ShopeeStock = p.Stock
		case "tokopedia":
			if p.TokopediaStock != p.Stock {
				conflictsFixed++
			}
			p.TokopediaStock = p.Stock
		case "tiktok":
			if p.TikTokStock != p.Stock {
				conflictsFixed++
			}
			p.TikTokStock = p.Stock
		}

		if p.ShopeeStock == p.Stock && p.TokopediaStock == p.Stock && p.TikTokStock == p.Stock {
			p.SyncStatus = "synced"
		}
		p.LastSyncAt = now
		h.db.Save(p)
	}

	mp.LastSyncAt = now
	mp.LastError = ""
	h.db.Save(&mp)

	_, _ = store.RecomputeMarketplaceStats(h.db, mp.StoreID)
	store.RecordSyncLog(
		h.db,
		mp.StoreID,
		mp.Platform,
		"manual_sync",
		"success",
		len(products),
		conflictsFixed,
		fmt.Sprintf("Sinkronisasi manual %s selesai: %d SKU disamakan, %d konflik stok diselesaikan", mp.Platform, len(products), conflictsFixed),
	)

	common.JSONSuccess(c, http.StatusOK, fmt.Sprintf("Sinkronisasi %s berhasil (%d SKU, %d konflik selesai)", mp.Platform, len(products), conflictsFixed), mp)
}

type UpdateMarketplaceSettingsRequest struct {
	ShopName            string   `json:"shop_name"`
	ShopExternalID      string   `json:"shop_external_id"`
	AutoSync            *bool    `json:"auto_sync"`
	WebhookEnabled      *bool    `json:"webhook_enabled"`
	SyncIntervalMinutes *int     `json:"sync_interval_minutes"`
	PriceMarkupPct      *float64 `json:"price_markup_pct"`
	RefreshToken        bool     `json:"refresh_token"`
}

func (h *Handler) UpdateMarketplaceSettings(c *gin.Context) {
	mpID := c.Param("id")
	var mp models.MarketplaceConnection
	if err := h.db.First(&mp, mpID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Marketplace tidak ditemukan", err.Error())
		return
	}

	var req UpdateMarketplaceSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Format pengaturan marketplace tidak valid", err.Error())
		return
	}

	if strings.TrimSpace(req.ShopName) != "" {
		mp.ShopName = strings.TrimSpace(req.ShopName)
	}
	if strings.TrimSpace(req.ShopExternalID) != "" {
		mp.ShopExternalID = strings.ToUpper(strings.TrimSpace(req.ShopExternalID))
	}
	if req.AutoSync != nil {
		mp.AutoSync = *req.AutoSync
	}
	if req.WebhookEnabled != nil {
		mp.WebhookEnabled = *req.WebhookEnabled
	}
	if req.SyncIntervalMinutes != nil && *req.SyncIntervalMinutes > 0 {
		mp.SyncIntervalMinutes = *req.SyncIntervalMinutes
	}
	if req.PriceMarkupPct != nil {
		mp.PriceMarkupPct = *req.PriceMarkupPct
	}
	if req.RefreshToken {
		mp.TokenExpiryDays = 30
		mp.EncryptedToken = fmt.Sprintf("aes256:%s_refreshed_%x", mp.PlatformSlug, time.Now().Unix()%100000)
		mp.Status = "connected"
	}

	if err := h.db.Save(&mp).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memperbarui pengaturan marketplace", err.Error())
		return
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, mp.StoreID)

	actionType := "settings_update"
	logMsg := fmt.Sprintf("Pengaturan %s diperbarui (Auto-Sync: %v, Interval: %d mnt, Markup: %.1f%%)", mp.Platform, mp.AutoSync, mp.SyncIntervalMinutes, mp.PriceMarkupPct)
	if req.RefreshToken {
		actionType = "token_refresh"
		logMsg = fmt.Sprintf("Token OAuth 2.0 %s berhasil diperbarui (Masa aktif: 30 hari)", mp.Platform)
	}

	store.RecordSyncLog(h.db, mp.StoreID, mp.Platform, actionType, "success", mp.ProductsSynced, 0, logMsg)
	common.JSONSuccess(c, http.StatusOK, logMsg, mp)
}

func (h *Handler) ToggleMarketplace(c *gin.Context) {
	mpID := c.Param("id")
	var mp models.MarketplaceConnection
	if err := h.db.First(&mp, mpID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Koneksi marketplace tidak ditemukan", err.Error())
		return
	}

	var body struct {
		Action string `json:"action"`
	}
	_ = c.ShouldBindJSON(&body)

	switch body.Action {
	case "toggle_status":
		if mp.Status == "connected" {
			mp.Status = "disconnected"
			mp.AutoSync = false
			h.db.Save(&mp)
			_, _ = store.RecomputeMarketplaceStats(h.db, mp.StoreID)
			store.RecordSyncLog(h.db, mp.StoreID, mp.Platform, "oauth_disconnect", "warning", 0, 0, fmt.Sprintf("Koneksi %s diputuskan", mp.Platform))
		} else {
			mp.Status = "connected"
			mp.AutoSync = true
			mp.TokenExpiryDays = 30
			mp.LastSyncAt = time.Now()
			h.db.Save(&mp)
			_, _ = store.RecomputeMarketplaceStats(h.db, mp.StoreID)
			store.RecordSyncLog(h.db, mp.StoreID, mp.Platform, "oauth_connect", "success", mp.ProductsSynced, 0, fmt.Sprintf("Koneksi %s diaktifkan kembali", mp.Platform))
		}
	case "toggle_autosync":
		mp.AutoSync = !mp.AutoSync
		h.db.Save(&mp)
		store.RecordSyncLog(h.db, mp.StoreID, mp.Platform, "settings_update", "success", mp.ProductsSynced, 0, fmt.Sprintf("Auto-Sync %s diubah menjadi %v", mp.Platform, mp.AutoSync))
	default:
		c.Params = append(c.Params, gin.Param{Key: "id", Value: mpID})
		h.SyncSingleMarketplace(c)
		return
	}

	common.JSONSuccess(c, http.StatusOK, fmt.Sprintf("Status integrasi %s berhasil diperbarui", mp.Platform), mp)
}

type WebhookSimulationRequest struct {
	EventType string `json:"event_type"`
	Platform  string `json:"platform"`
	ProductID uint   `json:"product_id"`
	Quantity  int    `json:"quantity"`
	BuyerName string `json:"buyer_name"`
	Courier   string `json:"courier"`
}

func (h *Handler) SimulateMarketplaceWebhook(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var req WebhookSimulationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Payload webhook tidak valid", err.Error())
		return
	}

	platform := strings.TrimSpace(req.Platform)
	if platform == "" {
		platform = "Shopee"
	}

	var product models.Product
	if req.ProductID > 0 {
		err = h.db.Where("store_id = ? AND id = ?", st.ID, req.ProductID).First(&product).Error
	} else {
		err = h.db.Where("store_id = ?", st.ID).Order("id ASC").First(&product).Error
	}
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Produk untuk simulasi webhook tidak ditemukan", err.Error())
		return
	}

	if req.EventType == "stock_mismatch" {
		slug := strings.ToLower(strings.Split(platform, " ")[0])
		driftStock := product.Stock + 3
		switch slug {
		case "shopee":
			product.ShopeeStock = driftStock
		case "tokopedia":
			product.TokopediaStock = driftStock
		default:
			product.TikTokStock = driftStock
		}
		product.SyncStatus = "conflict"
		h.db.Save(&product)

		_, _ = store.RecomputeMarketplaceStats(h.db, st.ID)
		msg := fmt.Sprintf("Webhook %s: Terdeteksi perubahan stok eksternal pada %s (%s). Stok Master: %d pcs vs %s: %d pcs", platform, product.Name, product.SKU, product.Stock, platform, driftStock)
		store.RecordSyncLog(h.db, st.ID, platform, "webhook_stock", "warning", 1, 0, msg)

		common.JSONSuccess(c, http.StatusOK, msg, gin.H{"product": product})
		return
	}

	qty := req.Quantity
	if qty <= 0 {
		qty = 1
	}

	buyer := strings.TrimSpace(req.BuyerName)
	if buyer == "" {
		buyer = "Nadia Putri"
	}
	parts := strings.Fields(buyer)
	initials := "NP"
	if len(parts) >= 2 {
		initials = strings.ToUpper(string(parts[0][0]) + string(parts[1][0]))
	} else if len(parts) == 1 && len(parts[0]) >= 2 {
		initials = strings.ToUpper(parts[0][:2])
	}

	courier := strings.TrimSpace(req.Courier)
	if courier == "" {
		courier = "J&T Express"
	}

	prefix := "SHP"
	slug := strings.ToLower(strings.Split(platform, " ")[0])
	if slug == "tokopedia" {
		prefix = "TKP"
	} else if slug == "tiktok" {
		prefix = "TTS"
	}

	codeNum := 10000 + (time.Now().Unix() % 89999)
	amount := product.Price * int64(qty)

	newOrder := models.Order{
		StoreID:       st.ID,
		OrderNumber:   fmt.Sprintf("INV-%s-%d", prefix, codeNum),
		PaymentCode:   fmt.Sprintf("ID: %d", codeNum),
		Marketplace:   platform,
		BuyerName:     buyer,
		BuyerInitials: initials,
		ProductName:   product.Name,
		ProductSKU:    product.SKU,
		PropertySub:   fmt.Sprintf("%s • %d pcs • %s", platform, qty, courier),
		Quantity:      qty,
		Amount:        amount,
		Courier:       courier,
		TrackingResi:  "",
		Status:        "Perlu Resi",
		SLADeadline:   "04j 00m tersisa",
		CreatedAt:     time.Now(),
	}

	if err := h.db.Create(&newOrder).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menyimpan pesanan baru dari webhook", err.Error())
		return
	}

	nextStock := product.Stock - qty
	if nextStock < 0 {
		nextStock = 0
	}
	product.Stock = nextStock
	product.ShopeeStock = nextStock
	product.TokopediaStock = nextStock
	product.TikTokStock = nextStock
	product.SoldCount += qty
	product.SyncStatus = "synced"
	if nextStock == 0 {
		product.Status = "out_of_stock"
	} else if nextStock <= 10 {
		product.Status = "low_stock"
	}
	product.LastSyncAt = time.Now()
	h.db.Save(&product)

	_, _ = store.RecomputeMarketplaceStats(h.db, st.ID)
	msg := fmt.Sprintf("Webhook %s: Pesanan baru %s (%d pcs %s) sebesar Rp %d masuk & stok otomatis dipotong ke %d pcs di 3 toko", platform, newOrder.OrderNumber, qty, product.SKU, amount, nextStock)
	store.RecordSyncLog(h.db, st.ID, platform, "webhook_order", "success", 1, 0, msg)

	common.JSONSuccess(c, http.StatusCreated, msg, gin.H{
		"order":   newOrder,
		"product": product,
	})
}

