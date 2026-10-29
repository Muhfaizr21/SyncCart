package sellers

import (
	"net/http"
	"strconv"

	"github.com/Muhfaizr21/SyncCart/backend/internal/common"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListSellers(c *gin.Context) {
	list, err := h.service.ListEnrichedSellers()
	if err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memuat daftar seller", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Daftar seller berhasil dimuat", list)
}

func (h *Handler) CreateSeller(c *gin.Context) {
	var req CreateSellerInput
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Data pendaftaran toko/seller tidak lengkap", err.Error())
		return
	}
	st, err := h.service.CreateSeller(req)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, err.Error(), "create_seller_failed")
		return
	}
	common.JSONSuccess(c, http.StatusCreated, "Toko dan akun seller baru berhasil dibuat", st)
}

func (h *Handler) UpdateSellerProfile(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID toko tidak valid", err.Error())
		return
	}
	var req UpdateSellerProfileInput
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Data pembaruan profil toko tidak valid", err.Error())
		return
	}
	st, err := h.service.UpdateSellerProfile(uint(storeID), req)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Gagal memperbarui profil toko", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Profil dan konfigurasi toko berhasil diperbarui", st)
}

func (h *Handler) UpdateSellerStatus(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID toko tidak valid", err.Error())
		return
	}
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Status toko wajib diisi", err.Error())
		return
	}
	st, err := h.service.UpdateSellerStatus(uint(storeID), req.Status)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Gagal memperbarui status toko", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Status operasional toko berhasil diperbarui", st)
}

func (h *Handler) UpdateSellerPlan(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID toko tidak valid", err.Error())
		return
	}
	var req struct {
		Plan         string `json:"plan" binding:"required"`
		BillingCycle string `json:"billing_cycle"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Paket langganan wajib diisi", err.Error())
		return
	}
	st, err := h.service.UpdateSellerPlan(uint(storeID), req.Plan, req.BillingCycle)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Gagal memperbarui paket langganan toko", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Paket langganan toko berhasil diperbarui", st)
}

func (h *Handler) SyncSellerCatalog(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID toko tidak valid", err.Error())
		return
	}
	syncedCount, err := h.service.SyncSellerProducts(uint(storeID))
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Gagal menyinkronkan katalog toko", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Seluruh SKU toko berhasil disinkronkan", gin.H{
		"store_id":     storeID,
		"synced_count": syncedCount,
	})
}

func (h *Handler) DeleteSeller(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID toko tidak valid", err.Error())
		return
	}
	if err := h.service.DeleteSeller(uint(storeID)); err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menghapus toko", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Toko beserta data terkait berhasil dihapus", gin.H{"deleted_id": storeID})
}

