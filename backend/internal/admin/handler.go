package admin

import (
	"net/http"
	"strconv"

	"github.com/Muhfaizr21/SyncCart/backend/internal/common"
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"github.com/gin-gonic/gin"
)

// Handler handles HTTP transport for all SuperAdmin endpoints (SOLID: Single Responsibility).
type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetOverview(c *gin.Context) {
	data, err := h.service.GetPlatformOverview()
	if err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memuat ringkasan platform SuperAdmin", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Ringkasan platform SuperAdmin berhasil dimuat", data)
}

func (h *Handler) CreateSeller(c *gin.Context) {
	var req CreateSellerInput
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Data pendaftaran toko/seller tidak lengkap", err.Error())
		return
	}
	st, err := h.service.CreateSellerAndStore(req)
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
	common.JSONSuccess(c, http.StatusOK, "Profil dan kuota operasional toko berhasil diperbarui", st)
}

func (h *Handler) SyncSellerCatalog(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID toko tidak valid", err.Error())
		return
	}
	count, err := h.service.SyncSellerProducts(uint(storeID))
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Gagal menyinkronkan katalog toko", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Seluruh SKU toko berhasil disinkronkan", gin.H{
		"store_id":     storeID,
		"synced_count": count,
	})
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

func (h *Handler) DeleteSeller(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID toko tidak valid", err.Error())
		return
	}
	if err := h.service.DeleteSellerStore(uint(storeID)); err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menghapus toko", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Toko beserta data terkait berhasil dihapus", gin.H{"deleted_id": storeID})
}

func (h *Handler) BulkAction(c *gin.Context) {
	var req BulkAdminActionInput
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Parameter aksi massal tidak valid", err.Error())
		return
	}
	affected, err := h.service.ExecuteBulkAction(req)
	if err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menjalankan aksi massal", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Aksi massal SuperAdmin berhasil dijalankan", gin.H{"affected": affected})
}

func (h *Handler) UpdateUserRole(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID pengguna tidak valid", err.Error())
		return
	}
	var req struct {
		Role   string `json:"role"`
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Data pembaruan pengguna tidak valid", err.Error())
		return
	}
	u, err := h.service.UpdateUserRoleOrStatus(uint(userID), req.Role, req.Status)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Gagal memperbarui akun pengguna", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Otoritas akun pengguna berhasil diperbarui", u)
}

func (h *Handler) CreateCoupon(c *gin.Context) {
	var req CouponInput
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Kode kupon wajib diisi", err.Error())
		return
	}
	coupon, err := h.service.CreatePlatformCoupon(req)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, err.Error(), "create_coupon_failed")
		return
	}
	common.JSONSuccess(c, http.StatusCreated, "Kupon promo platform berhasil diterbitkan", coupon)
}

func (h *Handler) DeleteCoupon(c *gin.Context) {
	couponID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID kupon tidak valid", err.Error())
		return
	}
	if err := h.service.DeletePlatformCoupon(uint(couponID)); err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menghapus kupon", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Kupon promo berhasil dihapus", gin.H{"deleted_id": couponID})
}

func (h *Handler) UpdateSettings(c *gin.Context) {
	var req models.PlatformSetting
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Format konfigurasi platform tidak valid", err.Error())
		return
	}
	cfg, err := h.service.UpdatePlatformSettings(req)
	if err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menyimpan pengaturan platform", err.Error())
		return
	}
	common.JSONSuccess(c, http.StatusOK, "Pengaturan global platform berhasil disimpan", cfg)
}

