package product

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

type CreateProductRequest struct {
	SKU              string `json:"sku" binding:"required"`
	Name             string `json:"name" binding:"required"`
	Description      string `json:"description"`
	ImagesJSON       string `json:"images_json"`
	Category         string `json:"category" binding:"required"`
	Warehouse        string `json:"warehouse"`
	WeightGram       int    `json:"weight_gram"`
	Price            int64  `json:"price" binding:"required"`
	Stock            int    `json:"stock"`
	PublishShopee    *bool  `json:"publish_shopee"`
	PublishTokopedia *bool  `json:"publish_tokopedia"`
	PublishTikTok    *bool  `json:"publish_tiktok"`
}

func (h *Handler) CreateProduct(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Lengkapi SKU, nama produk, kategori, dan harga", err.Error())
		return
	}

	warehouse := strings.TrimSpace(req.Warehouse)
	if warehouse == "" {
		warehouse = "Gudang Sunter, Jakarta Utara"
	}

	weightGram := req.WeightGram
	if weightGram <= 0 {
		weightGram = 250
	}

	pubShopee := true
	if req.PublishShopee != nil {
		pubShopee = *req.PublishShopee
	}
	pubTokopedia := true
	if req.PublishTokopedia != nil {
		pubTokopedia = *req.PublishTokopedia
	}
	pubTikTok := true
	if req.PublishTikTok != nil {
		pubTikTok = *req.PublishTikTok
	}

	status := "active"
	if req.Stock == 0 {
		status = "out_of_stock"
	} else if req.Stock <= 10 {
		status = "low_stock"
	}

	imagesJSON := strings.TrimSpace(req.ImagesJSON)
	if imagesJSON == "" {
		imagesJSON = "[]"
	}

	prod := models.Product{
		StoreID:          st.ID,
		SKU:              strings.ToUpper(strings.TrimSpace(req.SKU)),
		Name:             strings.TrimSpace(req.Name),
		Description:      strings.TrimSpace(req.Description),
		ImagesJSON:       imagesJSON,
		Category:         strings.TrimSpace(req.Category),
		Warehouse:        warehouse,
		WeightGram:       weightGram,
		Price:            req.Price,
		Stock:            req.Stock,
		SoldCount:        0,
		ShopeeStock:      req.Stock,
		TokopediaStock:   req.Stock,
		TikTokStock:      req.Stock,
		PublishShopee:    pubShopee,
		PublishTokopedia: pubTokopedia,
		PublishTikTok:    pubTikTok,
		SyncStatus:       "synced",
		Status:           status,
		AccentTone:       "tangerine",
		LastSyncAt:       time.Now(),
	}

	if err := h.db.Create(&prod).Error; err != nil {
		common.JSONError(c, http.StatusConflict, "SKU produk sudah digunakan atau gagal disimpan", err.Error())
		return
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, st.ID)
	store.RecordSyncLog(h.db, st.ID, "Semua Channel", "manual_sync", "success", 1, 0, fmt.Sprintf("Produk baru %s (%s) dipublikasikan ke Shopee, Tokopedia, dan TikTok Shop", prod.Name, prod.SKU))

	common.JSONSuccess(c, http.StatusCreated, "Produk baru berhasil ditambahkan dan disinkronkan ke 3 marketplace", prod)
}

type UpdateProductRequest struct {
	SKU              string `json:"sku"`
	Name             string `json:"name"`
	Description      string `json:"description"`
	ImagesJSON       string `json:"images_json"`
	Category         string `json:"category"`
	Warehouse        string `json:"warehouse"`
	WeightGram       *int   `json:"weight_gram"`
	Price            *int64 `json:"price"`
	Stock            *int   `json:"stock"`
	PublishShopee    *bool  `json:"publish_shopee"`
	PublishTokopedia *bool  `json:"publish_tokopedia"`
	PublishTikTok    *bool  `json:"publish_tiktok"`
	Status           string `json:"status"`
	ResolveSource    string `json:"resolve_source"`
}

func (h *Handler) UpdateProduct(c *gin.Context) {
	productID := c.Param("id")
	var prod models.Product
	if err := h.db.First(&prod, productID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Produk tidak ditemukan", err.Error())
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Data perubahan produk tidak valid", err.Error())
		return
	}

	if strings.TrimSpace(req.SKU) != "" {
		prod.SKU = strings.ToUpper(strings.TrimSpace(req.SKU))
	}
	if strings.TrimSpace(req.Name) != "" {
		prod.Name = strings.TrimSpace(req.Name)
	}
	if req.Description != "" {
		prod.Description = strings.TrimSpace(req.Description)
	}
	if strings.TrimSpace(req.ImagesJSON) != "" {
		prod.ImagesJSON = strings.TrimSpace(req.ImagesJSON)
	}
	if strings.TrimSpace(req.Category) != "" {
		prod.Category = strings.TrimSpace(req.Category)
	}
	if strings.TrimSpace(req.Warehouse) != "" {
		prod.Warehouse = strings.TrimSpace(req.Warehouse)
	}
	if req.WeightGram != nil && *req.WeightGram > 0 {
		prod.WeightGram = *req.WeightGram
	}
	if req.Price != nil && *req.Price > 0 {
		prod.Price = *req.Price
	}
	if req.PublishShopee != nil {
		prod.PublishShopee = *req.PublishShopee
	}
	if req.PublishTokopedia != nil {
		prod.PublishTokopedia = *req.PublishTokopedia
	}
	if req.PublishTikTok != nil {
		prod.PublishTikTok = *req.PublishTikTok
	}

	targetStock := prod.Stock
	switch strings.ToLower(strings.TrimSpace(req.ResolveSource)) {
	case "shopee":
		targetStock = prod.ShopeeStock
	case "tokopedia":
		targetStock = prod.TokopediaStock
	case "tiktok":
		targetStock = prod.TikTokStock
	case "master":
		targetStock = prod.Stock
	}

	if req.Stock != nil && *req.Stock >= 0 {
		targetStock = *req.Stock
	}

	prod.Stock = targetStock
	prod.ShopeeStock = targetStock
	prod.TokopediaStock = targetStock
	prod.TikTokStock = targetStock
	prod.SyncStatus = "synced"
	prod.LastSyncAt = time.Now()

	if strings.TrimSpace(req.Status) == "inactive" || strings.TrimSpace(req.Status) == "draft" {
		prod.Status = strings.TrimSpace(req.Status)
	} else {
		if targetStock == 0 {
			prod.Status = "out_of_stock"
		} else if targetStock <= 10 {
			prod.Status = "low_stock"
		} else {
			prod.Status = "active"
		}
	}

	if err := h.db.Save(&prod).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menyimpan perubahan produk", err.Error())
		return
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, prod.StoreID)
	store.RecordSyncLog(h.db, prod.StoreID, "Semua Channel", "manual_sync", "success", 1, 0, fmt.Sprintf("Produk %s (%s) diperbarui & stok disinkronkan (%d pcs)", prod.Name, prod.SKU, prod.Stock))

	common.JSONSuccess(c, http.StatusOK, fmt.Sprintf("Produk %s berhasil diperbarui dan disinkronkan", prod.SKU), prod)
}

func (h *Handler) DuplicateProduct(c *gin.Context) {
	productID := c.Param("id")
	var src models.Product
	if err := h.db.First(&src, productID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Produk sumber tidak ditemukan", err.Error())
		return
	}

	suffix := fmt.Sprintf("%02d", time.Now().Unix()%100)
	cloned := models.Product{
		StoreID:          src.StoreID,
		SKU:              fmt.Sprintf("%s-CP%s", src.SKU, suffix),
		Name:             fmt.Sprintf("%s (Varian Baru)", src.Name),
		Description:      src.Description,
		ImagesJSON:       src.ImagesJSON,
		Category:         src.Category,
		Warehouse:        src.Warehouse,
		WeightGram:       src.WeightGram,
		Price:            src.Price,
		Stock:            src.Stock,
		SoldCount:        0,
		ShopeeStock:      src.Stock,
		TokopediaStock:   src.Stock,
		TikTokStock:      src.Stock,
		PublishShopee:    src.PublishShopee,
		PublishTokopedia: src.PublishTokopedia,
		PublishTikTok:    src.PublishTikTok,
		SyncStatus:       "synced",
		Status:           src.Status,
		AccentTone:       src.AccentTone,
		LastSyncAt:       time.Now(),
	}

	if err := h.db.Create(&cloned).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menduplikasi produk", err.Error())
		return
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, src.StoreID)
	store.RecordSyncLog(h.db, src.StoreID, "Semua Channel", "manual_sync", "success", 1, 0, fmt.Sprintf("Produk %s diduplikasi menjadi %s", src.SKU, cloned.SKU))

	common.JSONSuccess(c, http.StatusCreated, fmt.Sprintf("Produk berhasil diduplikasi sebagai %s", cloned.SKU), cloned)
}

type BulkProductActionRequest struct {
	ProductIDs []uint  `json:"product_ids" binding:"required"`
	Action     string  `json:"action" binding:"required"`
	DeltaStock int     `json:"delta_stock"`
	PricePct   float64 `json:"price_pct"`
	Status     string  `json:"status"`
}

func (h *Handler) BulkProductAction(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var req BulkProductActionRequest
	if err := c.ShouldBindJSON(&req); err != nil || len(req.ProductIDs) == 0 {
		common.JSONError(c, http.StatusBadRequest, "Pilih minimal satu produk untuk aksi massal", "empty product_ids")
		return
	}

	var products []models.Product
	if err := h.db.Where("store_id = ? AND id IN ?", st.ID, req.ProductIDs).Find(&products).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memuat produk terpilih", err.Error())
		return
	}

	now := time.Now()
	affected := len(products)
	msg := ""

	switch req.Action {
	case "delete":
		h.db.Where("store_id = ? AND id IN ?", st.ID, req.ProductIDs).Delete(&models.Product{})
		msg = fmt.Sprintf("%d produk berhasil dihapus dari katalog master", affected)
	case "restock":
		delta := req.DeltaStock
		if delta == 0 {
			delta = 10
		}
		for i := range products {
			next := products[i].Stock + delta
			if next < 0 {
				next = 0
			}
			products[i].Stock = next
			products[i].ShopeeStock = next
			products[i].TokopediaStock = next
			products[i].TikTokStock = next
			products[i].SyncStatus = "synced"
			products[i].LastSyncAt = now
			if next == 0 {
				products[i].Status = "out_of_stock"
			} else if next <= 10 {
				products[i].Status = "low_stock"
			} else {
				products[i].Status = "active"
			}
			h.db.Save(&products[i])
		}
		msg = fmt.Sprintf("Stok %d produk berhasil ditambah (%+d pcs) dan disinkronkan ke 3 marketplace", affected, delta)
	case "price_pct":
		pct := req.PricePct
		for i := range products {
			newPrice := int64(float64(products[i].Price) * (1.0 + pct/100.0))
			if newPrice < 1000 {
				newPrice = 1000
			}
			products[i].Price = newPrice
			products[i].LastSyncAt = now
			h.db.Save(&products[i])
		}
		msg = fmt.Sprintf("Harga %d produk berhasil disesuaikan (%+.1f%%) di katalog master", affected, pct)
	case "status":
		targetStatus := req.Status
		if targetStatus == "" {
			targetStatus = "active"
		}
		for i := range products {
			products[i].Status = targetStatus
			products[i].LastSyncAt = now
			h.db.Save(&products[i])
		}
		msg = fmt.Sprintf("Status %d produk berhasil diubah menjadi %s", affected, targetStatus)
	default:
		for i := range products {
			products[i].ShopeeStock = products[i].Stock
			products[i].TokopediaStock = products[i].Stock
			products[i].TikTokStock = products[i].Stock
			products[i].SyncStatus = "synced"
			products[i].LastSyncAt = now
			h.db.Save(&products[i])
		}
		msg = fmt.Sprintf("%d produk berhasil disamakan stoknya lintas 3 marketplace", affected)
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, st.ID)
	store.RecordSyncLog(h.db, st.ID, "Semua Channel", "bulk_action", "success", affected, 0, msg)

	common.JSONSuccess(c, http.StatusOK, msg, gin.H{"affected": affected})
}

type AdjustStockRequest struct {
	Delta int    `json:"delta"`
	Price *int64 `json:"price"`
}

func (h *Handler) UpdateProductStock(c *gin.Context) {
	productID := c.Param("id")
	var prod models.Product
	if err := h.db.First(&prod, productID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Produk tidak ditemukan", err.Error())
		return
	}

	var req AdjustStockRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Format perubahan stok tidak valid", err.Error())
		return
	}

	nextStock := prod.Stock + req.Delta
	if nextStock < 0 {
		nextStock = 0
	}

	prod.Stock = nextStock
	prod.ShopeeStock = nextStock
	prod.TokopediaStock = nextStock
	prod.TikTokStock = nextStock
	prod.SyncStatus = "synced"
	prod.LastSyncAt = time.Now()

	if req.Delta < 0 {
		prod.SoldCount += (-req.Delta)
	}
	if req.Price != nil && *req.Price > 0 {
		prod.Price = *req.Price
	}

	if nextStock == 0 {
		prod.Status = "out_of_stock"
	} else if nextStock <= 10 {
		prod.Status = "low_stock"
	} else {
		prod.Status = "active"
	}

	if err := h.db.Save(&prod).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memperbarui stok produk", err.Error())
		return
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, prod.StoreID)
	store.RecordSyncLog(h.db, prod.StoreID, "Semua Channel", "manual_sync", "success", 1, 0, fmt.Sprintf("Stok SKU %s diperbarui menjadi %d pcs di Shopee, Tokopedia, & TikTok Shop", prod.SKU, nextStock))

	common.JSONSuccess(c, http.StatusOK, "Stok produk berhasil disinkronkan ke Shopee, Tokopedia, dan TikTok Shop", prod)
}

func (h *Handler) SyncAllProductsStock(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var products []models.Product
	h.db.Where("store_id = ?", st.ID).Find(&products)

	now := time.Now()
	conflictsFixed := 0
	for i := range products {
		if products[i].ShopeeStock != products[i].Stock ||
			products[i].TokopediaStock != products[i].Stock ||
			products[i].TikTokStock != products[i].Stock ||
			products[i].SyncStatus == "conflict" {
			conflictsFixed++
		}
		products[i].ShopeeStock = products[i].Stock
		products[i].TokopediaStock = products[i].Stock
		products[i].TikTokStock = products[i].Stock
		products[i].SyncStatus = "synced"
		products[i].LastSyncAt = now
		h.db.Save(&products[i])
	}

	h.db.Model(&models.MarketplaceConnection{}).
		Where("store_id = ? AND status = ?", st.ID, "connected").
		Updates(map[string]interface{}{"last_sync_at": now})

	_, _ = store.RecomputeMarketplaceStats(h.db, st.ID)
	store.RecordSyncLog(h.db, st.ID, "Semua Channel", "manual_sync", "success", len(products), conflictsFixed, fmt.Sprintf("Sinkronisasi massal 3 marketplace selesai (%d SKU disinkronkan, %d konflik diselesaikan)", len(products), conflictsFixed))

	common.JSONSuccess(c, http.StatusOK, "Seluruh stok produk berhasil disinkronkan lintas 3 marketplace", products)
}

func (h *Handler) DeleteProduct(c *gin.Context) {
	productID := c.Param("id")
	var prod models.Product
	if err := h.db.First(&prod, productID).Error; err == nil {
		storeID := prod.StoreID
		sku := prod.SKU
		h.db.Delete(&prod)
		_, _ = store.RecomputeMarketplaceStats(h.db, storeID)
		store.RecordSyncLog(h.db, storeID, "Semua Channel", "manual_sync", "warning", 1, 0, fmt.Sprintf("Produk SKU %s dihapus dari katalog master & 3 marketplace", sku))
	}
	common.JSONSuccess(c, http.StatusOK, "Produk berhasil dihapus dari katalog", gin.H{"deleted_id": productID})
}

