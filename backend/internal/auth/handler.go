package auth

import (
	"net/http"

	"github.com/Muhfaizr21/SyncCart/backend/internal/common"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Format data pendaftaran tidak valid", err.Error())
		return
	}

	result, err := h.service.Register(input)
	if err != nil {
		common.JSONError(c, http.StatusBadRequest, err.Error(), "registration_failed")
		return
	}

	common.JSONSuccess(c, http.StatusCreated, "Pendaftaran akun dan toko berhasil", result)
}

func (h *Handler) Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Format email atau password tidak valid", err.Error())
		return
	}

	result, err := h.service.Login(input)
	if err != nil {
		common.JSONError(c, http.StatusUnauthorized, err.Error(), "invalid_credentials")
		return
	}

	common.JSONSuccess(c, http.StatusOK, "Login berhasil", result)
}

func (h *Handler) Me(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		common.JSONError(c, http.StatusUnauthorized, "Sesi tidak ditemukan", "unauthorized")
		return
	}

	userID, _ := userIDVal.(uint)
	user, err := h.service.GetByID(userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Data pengguna tidak ditemukan", err.Error())
		return
	}

	common.JSONSuccess(c, http.StatusOK, "Profil pengguna aktif", user)
}

func (h *Handler) Logout(c *gin.Context) {
	common.JSONSuccess(c, http.StatusOK, "Berhasil keluar dari sesi", nil)
}

func (h *Handler) ListUsersAdmin(c *gin.Context) {
	users, err := h.service.ListAllUsers()
	if err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memuat daftar pengguna", err.Error())
		return
	}

	common.JSONSuccess(c, http.StatusOK, "Daftar seluruh akun terdaftar di PostgreSQL", users)
}

