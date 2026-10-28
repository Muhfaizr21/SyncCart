package order

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

type CreateOrderRequest struct {
	Marketplace     string `json:"marketplace"`
	ProductID       uint   `json:"product_id" binding:"required"`
	Quantity        int    `json:"quantity"`
	BuyerName       string `json:"buyer_name" binding:"required"`
	BuyerPhone      string `json:"buyer_phone"`
	ShippingAddress string `json:"shipping_address"`
	PaymentMethod   string `json:"payment_method"`
	Courier         string `json:"courier"`
	Notes           string `json:"notes"`
}

func (h *Handler) CreateManualOrder(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Lengkapi produk dan nama pembeli", err.Error())
		return
	}

	var prod models.Product
	if err := h.db.Where("store_id = ? AND id = ?", st.ID, req.ProductID).First(&prod).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Produk tidak ditemukan di katalog", err.Error())
		return
	}

	qty := req.Quantity
	if qty <= 0 {
		qty = 1
	}

	platform := strings.TrimSpace(req.Marketplace)
	if platform == "" {
		platform = "Shopee"
	}

	buyer := strings.TrimSpace(req.BuyerName)
	parts := strings.Fields(buyer)
	initials := "PL"
	if len(parts) >= 2 {
		initials = strings.ToUpper(string(parts[0][0]) + string(parts[1][0]))
	} else if len(parts) == 1 && len(parts[0]) >= 2 {
		initials = strings.ToUpper(parts[0][:2])
	}

	courier := strings.TrimSpace(req.Courier)
	if courier == "" {
		courier = "J&T Express"
	}

	phone := strings.TrimSpace(req.BuyerPhone)
	if phone == "" {
		phone = "0812-8890-4412"
	}

	address := strings.TrimSpace(req.ShippingAddress)
	if address == "" {
		address = "Jl. Sudirman No. 45, Jakarta Selatan"
	}

	payMethod := strings.TrimSpace(req.PaymentMethod)
	if payMethod == "" {
		payMethod = "QRIS / Virtual Account"
	}

	prefix := "SHP"
	slug := strings.ToLower(strings.Split(platform, " ")[0])
	if slug == "tokopedia" {
		prefix = "TKP"
	} else if slug == "tiktok" {
		prefix = "TTS"
	}

	codeNum := 10000 + (time.Now().UnixNano() % 89999)
	amount := prod.Price * int64(qty)

	newOrder := models.Order{
		StoreID:         st.ID,
		OrderNumber:     fmt.Sprintf("INV-%s-%d", prefix, codeNum),
		PaymentCode:     fmt.Sprintf("ID: %d", codeNum),
		Marketplace:     platform,
		BuyerName:       buyer,
		BuyerPhone:      phone,
		ShippingAddress: address,
		PaymentMethod:   payMethod,
		Notes:           strings.TrimSpace(req.Notes),
		BuyerInitials:   initials,
		ProductName:     prod.Name,
		ProductSKU:      prod.SKU,
		PropertySub:     fmt.Sprintf("%s • %d pcs • %s", platform, qty, courier),
		Quantity:        qty,
		Amount:          amount,
		Courier:         courier,
		TrackingResi:    "",
		Status:          "Perlu Resi",
		SLADeadline:     "04j 00m tersisa",
		CreatedAt:       time.Now(),
	}

	if err := h.db.Create(&newOrder).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menyimpan pesanan baru ke PostgreSQL", err.Error())
		return
	}

	nextStock := prod.Stock - qty
	if nextStock < 0 {
		nextStock = 0
	}
	prod.Stock = nextStock
	prod.ShopeeStock = nextStock
	prod.TokopediaStock = nextStock
	prod.TikTokStock = nextStock
	prod.SoldCount += qty
	prod.SyncStatus = "synced"
	if nextStock == 0 {
		prod.Status = "out_of_stock"
	} else if nextStock <= 10 {
		prod.Status = "low_stock"
	}
	prod.LastSyncAt = time.Now()
	h.db.Save(&prod)

	_, _ = store.RecomputeMarketplaceStats(h.db, st.ID)
	store.RecordSyncLog(h.db, st.ID, platform, "manual_order", "success", 1, 0, fmt.Sprintf("Pesanan %s (%d pcs %s) dibuat & stok dipotong ke %d pcs", newOrder.OrderNumber, qty, prod.SKU, nextStock))

	common.JSONSuccess(c, http.StatusCreated, fmt.Sprintf("Pesanan %s berhasil dibuat & stok dipotong otomatis", newOrder.OrderNumber), newOrder)
}

type ShipOrderRequest struct {
	Courier         string `json:"courier"`
	TrackingResi    string `json:"tracking_resi"`
	Status          string `json:"status"`
	ShippingAddress string `json:"shipping_address"`
	BuyerPhone      string `json:"buyer_phone"`
	Notes           string `json:"notes"`
}

func generateCourierResi(courier string, orderID uint) string {
	cLower := strings.ToLower(courier)
	prefix := "SC"
	if strings.Contains(cLower, "j&t") || strings.Contains(cLower, "jnt") {
		prefix = "JT"
	} else if strings.Contains(cLower, "jne") {
		prefix = "JNE"
	} else if strings.Contains(cLower, "sicepat") {
		prefix = "SCP"
	} else if strings.Contains(cLower, "anteraja") {
		prefix = "ANT"
	}
	return fmt.Sprintf("%s-%d%03d", prefix, time.Now().Unix()%100000, orderID)
}

func (h *Handler) UpdateOrderShipping(c *gin.Context) {
	orderID := c.Param("id")
	var ord models.Order
	if err := h.db.First(&ord, orderID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Pesanan tidak ditemukan", err.Error())
		return
	}

	prevStatus := ord.Status

	var req ShipOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Data pengiriman tidak valid", err.Error())
		return
	}

	if strings.TrimSpace(req.Courier) != "" {
		ord.Courier = strings.TrimSpace(req.Courier)
	}
	if strings.TrimSpace(req.ShippingAddress) != "" {
		ord.ShippingAddress = strings.TrimSpace(req.ShippingAddress)
	}
	if strings.TrimSpace(req.BuyerPhone) != "" {
		ord.BuyerPhone = strings.TrimSpace(req.BuyerPhone)
	}
	if req.Notes != "" {
		ord.Notes = strings.TrimSpace(req.Notes)
	}

	targetStatus := strings.TrimSpace(req.Status)
	if targetStatus == "" {
		targetStatus = "Shipped"
	}
	ord.Status = targetStatus

	if strings.TrimSpace(req.TrackingResi) != "" {
		ord.TrackingResi = strings.ToUpper(strings.TrimSpace(req.TrackingResi))
	} else if ord.TrackingResi == "" && (targetStatus == "Shipped" || targetStatus == "Completed") {
		ord.TrackingResi = generateCourierResi(ord.Courier, ord.ID)
	}

	switch targetStatus {
	case "Shipped":
		ord.SLADeadline = "Dalam pengiriman kurir"
	case "Completed":
		ord.SLADeadline = "Pesanan selesai • Dana cair"
	case "Cancelled":
		ord.SLADeadline = "Dibatalkan • Stok dikembalikan"
	default:
		ord.SLADeadline = "03j 45m tersisa"
	}

	ord.PropertySub = fmt.Sprintf("%s • %d pcs • %s", ord.Marketplace, ord.Quantity, ord.Courier)

	if err := h.db.Save(&ord).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memperbarui pesanan", err.Error())
		return
	}

	if targetStatus == "Cancelled" && prevStatus != "Cancelled" {
		var prod models.Product
		if err := h.db.Where("store_id = ? AND sku = ?", ord.StoreID, ord.ProductSKU).First(&prod).Error; err == nil {
			restored := prod.Stock + ord.Quantity
			prod.Stock = restored
			prod.ShopeeStock = restored
			prod.TokopediaStock = restored
			prod.TikTokStock = restored
			if prod.SoldCount >= ord.Quantity {
				prod.SoldCount -= ord.Quantity
			}
			if restored > 10 {
				prod.Status = "active"
			} else if restored > 0 {
				prod.Status = "low_stock"
			}
			prod.LastSyncAt = time.Now()
			h.db.Save(&prod)
		}
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, ord.StoreID)
	store.RecordSyncLog(h.db, ord.StoreID, ord.Marketplace, "order_update", "success", 1, 0, fmt.Sprintf("Pesanan %s diperbarui ke status %s (Resi: %s)", ord.OrderNumber, ord.Status, ord.TrackingResi))

	common.JSONSuccess(c, http.StatusOK, fmt.Sprintf("Pesanan %s berhasil diperbarui (%s)", ord.OrderNumber, ord.Status), ord)
}

type BulkOrderActionRequest struct {
	OrderIDs []uint `json:"order_ids" binding:"required"`
	Action   string `json:"action" binding:"required"`
	Courier  string `json:"courier"`
}

func (h *Handler) BulkOrderAction(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var req BulkOrderActionRequest
	if err := c.ShouldBindJSON(&req); err != nil || len(req.OrderIDs) == 0 {
		common.JSONError(c, http.StatusBadRequest, "Pilih minimal satu pesanan untuk aksi massal", "empty order_ids")
		return
	}

	var orders []models.Order
	if err := h.db.Where("store_id = ? AND id IN ?", st.ID, req.OrderIDs).Find(&orders).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memuat daftar pesanan", err.Error())
		return
	}

	affected := len(orders)
	msg := ""

	switch req.Action {
	case "delete":
		h.db.Where("store_id = ? AND id IN ?", st.ID, req.OrderIDs).Delete(&models.Order{})
		msg = fmt.Sprintf("%d pesanan berhasil dihapus dari daftar", affected)
	case "complete":
		for i := range orders {
			if orders[i].TrackingResi == "" {
				orders[i].TrackingResi = generateCourierResi(orders[i].Courier, orders[i].ID)
			}
			orders[i].Status = "Completed"
			orders[i].SLADeadline = "Pesanan selesai • Dana cair"
			h.db.Save(&orders[i])
		}
		msg = fmt.Sprintf("%d pesanan berhasil ditandai Selesai", affected)
	case "cancel":
		for i := range orders {
			if orders[i].Status != "Cancelled" {
				var prod models.Product
				if err := h.db.Where("store_id = ? AND sku = ?", st.ID, orders[i].ProductSKU).First(&prod).Error; err == nil {
					restored := prod.Stock + orders[i].Quantity
					prod.Stock = restored
					prod.ShopeeStock = restored
					prod.TokopediaStock = restored
					prod.TikTokStock = restored
					if prod.SoldCount >= orders[i].Quantity {
						prod.SoldCount -= orders[i].Quantity
					}
					h.db.Save(&prod)
				}
			}
			orders[i].Status = "Cancelled"
			orders[i].SLADeadline = "Dibatalkan • Stok dikembalikan"
			h.db.Save(&orders[i])
		}
		msg = fmt.Sprintf("%d pesanan dibatalkan & stok produk dikembalikan ke 3 marketplace", affected)
	default:
		for i := range orders {
			if strings.TrimSpace(req.Courier) != "" {
				orders[i].Courier = strings.TrimSpace(req.Courier)
			}
			if orders[i].TrackingResi == "" {
				orders[i].TrackingResi = generateCourierResi(orders[i].Courier, orders[i].ID)
			}
			orders[i].Status = "Shipped"
			orders[i].SLADeadline = "Dalam pengiriman kurir"
			h.db.Save(&orders[i])
		}
		msg = fmt.Sprintf("Resi otomatis dibuat & %d pesanan diubah menjadi Shipped", affected)
	}

	_, _ = store.RecomputeMarketplaceStats(h.db, st.ID)
	store.RecordSyncLog(h.db, st.ID, "Semua Channel", "bulk_orders", "success", affected, 0, msg)

	common.JSONSuccess(c, http.StatusOK, msg, gin.H{"affected": affected})
}

func (h *Handler) DeleteOrder(c *gin.Context) {
	orderID := c.Param("id")
	var ord models.Order
	if err := h.db.First(&ord, orderID).Error; err == nil {
		storeID := ord.StoreID
		h.db.Delete(&ord)
		_, _ = store.RecomputeMarketplaceStats(h.db, storeID)
	}
	common.JSONSuccess(c, http.StatusOK, "Pesanan berhasil dihapus", gin.H{"deleted_id": orderID})
}

