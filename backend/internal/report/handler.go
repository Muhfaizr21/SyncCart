package report

import (
	"net/http"

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

func (h *Handler) GetReportSummary(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var orders []models.Order
	h.db.Where("store_id = ?", st.ID).Order("id DESC").Find(&orders)

	var products []models.Product
	h.db.Where("store_id = ?", st.ID).Order("sold_count DESC").Find(&products)

	var marketplaces []models.MarketplaceConnection
	h.db.Where("store_id = ?", st.ID).Order("id ASC").Find(&marketplaces)

	var grossRevenue int64 = 0
	var activeOrderCount int = 0
	for _, o := range orders {
		if o.Status != "Cancelled" {
			grossRevenue += o.Amount
			activeOrderCount++
		}
	}

	common.JSONSuccess(c, http.StatusOK, "Berhasil memuat ringkasan laporan keuangan & analitik dari PostgreSQL", gin.H{
		"store":              st,
		"gross_revenue":      grossRevenue,
		"active_order_count": activeOrderCount,
		"products":           products,
		"orders":             orders,
		"marketplaces":       marketplaces,
	})
}

