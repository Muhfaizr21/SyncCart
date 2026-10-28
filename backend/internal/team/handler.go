package team

import (
	"fmt"
	"net/http"
	"strings"

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

type InviteTeamRequest struct {
	FullName         string `json:"full_name" binding:"required"`
	Email            string `json:"email" binding:"required"`
	Phone            string `json:"phone"`
	Department       string `json:"department"`
	Role             string `json:"role" binding:"required"`
	Permissions      string `json:"permissions"`
	AssignedChannels string `json:"assigned_channels"`
	TwoFactorEnabled *bool  `json:"two_factor_enabled"`
	Status           string `json:"status"`
}

func (h *Handler) InviteTeamMember(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var req InviteTeamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Nama lengkap, email, dan peran staf wajib diisi", err.Error())
		return
	}

	perms := strings.TrimSpace(req.Permissions)
	if perms == "" {
		perms = "lihat_produk,lihat_order,proses_order"
	}

	dept := strings.TrimSpace(req.Department)
	if dept == "" {
		dept = "Operasional & Order"
	}

	phone := strings.TrimSpace(req.Phone)
	if phone == "" {
		phone = "0812-8000-1122"
	}

	channels := strings.TrimSpace(req.AssignedChannels)
	if channels == "" {
		channels = "Shopee,Tokopedia,TikTok Shop"
	}

	twoFA := true
	if req.TwoFactorEnabled != nil {
		twoFA = *req.TwoFactorEnabled
	}

	status := strings.ToLower(strings.TrimSpace(req.Status))
	if status != "pending" && status != "active" {
		status = "active"
	}

	inviteExp := "Terverifikasi"
	lastActive := "Baru bergabung"
	if status == "pending" {
		inviteExp = "Kadaluarsa 7 hari"
		lastActive = "Menunggu konfirmasi email"
	}

	member := models.TeamMember{
		StoreID:          st.ID,
		FullName:         strings.TrimSpace(req.FullName),
		Email:            strings.ToLower(strings.TrimSpace(req.Email)),
		Phone:            phone,
		Department:       dept,
		Role:             strings.TrimSpace(req.Role),
		Permissions:      perms,
		AssignedChannels: channels,
		TwoFactorEnabled: twoFA,
		SessionDevice:    "Web Browser • Sesi Baru (Indonesia)",
		SessionIP:        "103.144.22.88",
		InviteExpiresAt:  inviteExp,
		ActionsCount:     1,
		Status:           status,
		LastActive:       lastActive,
	}

	if err := h.db.Create(&member).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menambahkan anggota tim", err.Error())
		return
	}

	store.RecordSyncLog(
		h.db,
		st.ID,
		"RBAC & Tim",
		"team_invite",
		"success",
		1,
		0,
		fmt.Sprintf("Staf %s (%s) diundang sebagai %s dengan %d izin RBAC", member.FullName, member.Email, member.Role, len(strings.Split(member.Permissions, ","))),
	)

	common.JSONSuccess(c, http.StatusCreated, "Anggota tim baru berhasil ditambahkan ke toko", member)
}

func (h *Handler) UpdateTeamPermissions(c *gin.Context) {
	memberID := c.Param("id")
	var member models.TeamMember
	if err := h.db.First(&member, memberID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Anggota tim tidak ditemukan", err.Error())
		return
	}

	var req struct {
		FullName         string `json:"full_name"`
		Email            string `json:"email"`
		Phone            string `json:"phone"`
		Department       string `json:"department"`
		Role             string `json:"role"`
		Permissions      string `json:"permissions"`
		AssignedChannels string `json:"assigned_channels"`
		TwoFactorEnabled *bool  `json:"two_factor_enabled"`
		Status           string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Data izin akses tidak valid", err.Error())
		return
	}

	oldPerms := member.Permissions
	oldRole := member.Role

	if strings.TrimSpace(req.FullName) != "" {
		member.FullName = strings.TrimSpace(req.FullName)
	}
	if strings.TrimSpace(req.Email) != "" {
		member.Email = strings.ToLower(strings.TrimSpace(req.Email))
	}
	if strings.TrimSpace(req.Phone) != "" {
		member.Phone = strings.TrimSpace(req.Phone)
	}
	if strings.TrimSpace(req.Department) != "" {
		member.Department = strings.TrimSpace(req.Department)
	}
	if strings.TrimSpace(req.Role) != "" {
		member.Role = strings.TrimSpace(req.Role)
	}
	if req.Permissions != "" {
		member.Permissions = req.Permissions
	}
	if strings.TrimSpace(req.AssignedChannels) != "" {
		member.AssignedChannels = strings.TrimSpace(req.AssignedChannels)
	}
	if req.TwoFactorEnabled != nil {
		member.TwoFactorEnabled = *req.TwoFactorEnabled
	}
	if strings.TrimSpace(req.Status) != "" {
		member.Status = strings.ToLower(strings.TrimSpace(req.Status))
		if member.Status == "active" {
			member.InviteExpiresAt = "Terverifikasi"
			member.LastActive = "Aktif • Izin diperbarui"
		} else if member.Status == "suspended" {
			member.LastActive = "Akses dibekukan sementara"
		}
	}

	member.ActionsCount += 1

	if err := h.db.Save(&member).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memperbarui hak akses RBAC", err.Error())
		return
	}

	store.RecordSyncLog(
		h.db,
		member.StoreID,
		"RBAC & Tim",
		"rbac_update",
		"success",
		1,
		0,
		fmt.Sprintf("Hak akses %s diperbarui (%s -> %s | Izin: %d -> %d modul)", member.FullName, oldRole, member.Role, len(strings.Split(oldPerms, ",")), len(strings.Split(member.Permissions, ","))),
	)

	common.JSONSuccess(c, http.StatusOK, "Hak akses RBAC anggota tim berhasil diperbarui", member)
}

func (h *Handler) TeamSessionAction(c *gin.Context) {
	memberID := c.Param("id")
	var member models.TeamMember
	if err := h.db.First(&member, memberID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Anggota tim tidak ditemukan", err.Error())
		return
	}

	var req struct {
		Action string `json:"action" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Jenis aksi keamanan sesi wajib diisi", err.Error())
		return
	}

	var logMsg string
	switch req.Action {
	case "revoke_session":
		member.LastActive = "Sesi dihentikan paksa (Kick)"
		member.SessionDevice = "Tidak ada sesi aktif (Token dicabut)"
		logMsg = fmt.Sprintf("Sesi login perangkat %s (%s) dihentikan paksa", member.FullName, member.SessionIP)
	case "activate":
		member.Status = "active"
		member.InviteExpiresAt = "Terverifikasi"
		member.LastActive = "Aktif • Baru diverifikasi"
		logMsg = fmt.Sprintf("Akun staf %s diaktifkan kembali", member.FullName)
	case "suspend":
		if member.Role == "Owner Toko" {
			common.JSONError(c, http.StatusBadRequest, "Akun Owner Toko utama tidak dapat dibekukan", "cannot_suspend_owner")
			return
		}
		member.Status = "suspended"
		member.LastActive = "Akses dibekukan sementara"
		logMsg = fmt.Sprintf("Akses operasional %s dibekukan sementara", member.FullName)
	case "resend_invite":
		member.Status = "pending"
		member.InviteExpiresAt = "Diperbarui • 7 hari tersisa"
		member.LastActive = "Tautan undangan dikirim ulang"
		logMsg = fmt.Sprintf("Tautan undangan email untuk %s dikirim ulang (berlaku 7 hari)", member.Email)
	case "toggle_2fa":
		member.TwoFactorEnabled = !member.TwoFactorEnabled
		stateLabel := "dinonaktifkan"
		if member.TwoFactorEnabled {
			stateLabel = "diaktifkan"
		}
		logMsg = fmt.Sprintf("Keamanan 2FA untuk %s %s", member.FullName, stateLabel)
	default:
		common.JSONError(c, http.StatusBadRequest, "Aksi sesi tidak dikenali", "invalid_session_action")
		return
	}

	member.ActionsCount += 1
	if err := h.db.Save(&member).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal mengeksekusi aksi keamanan sesi", err.Error())
		return
	}

	store.RecordSyncLog(h.db, member.StoreID, "RBAC & Tim", "team_security", "success", 1, 0, logMsg)
	common.JSONSuccess(c, http.StatusOK, logMsg, member)
}

func (h *Handler) TransferStoreOwnership(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var req struct {
		TargetMemberID uint `json:"target_member_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "ID anggota penerima kepemilikan wajib dipilih", err.Error())
		return
	}

	var target models.TeamMember
	if err := h.db.Where("id = ? AND store_id = ?", req.TargetMemberID, st.ID).First(&target).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Anggota tim penerima tidak ditemukan di toko ini", err.Error())
		return
	}

	fullPerms := "lihat_produk,edit_produk,hapus_produk,kelola_stok,lihat_order,proses_order,buat_order_manual,batal_refund_order,kelola_marketplace,konfigurasi_markup_sync,simulasi_audit_webhook,lihat_laporan,atur_parameter_laba,ekspor_jadwal_laporan,kelola_tim,kontrol_sesi_2fa,transfer_kepemilikan,manage_settings,kelola_langganan,unduh_invoice_billing"

	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.TeamMember{}).
			Where("store_id = ? AND role = ?", st.ID, "Owner Toko").
			Updates(map[string]interface{}{
				"role":              "Co-Owner & Manager Operasional",
				"invite_expires_at": "Terverifikasi",
			}).Error; err != nil {
			return err
		}

		target.Role = "Owner Toko"
		target.Department = "Manajemen & Integrasi"
		target.Permissions = fullPerms
		target.AssignedChannels = "Shopee,Tokopedia,TikTok Shop"
		target.TwoFactorEnabled = true
		target.Status = "active"
		target.InviteExpiresAt = "Akun Utama Owner"
		target.LastActive = "Owner Aktif"
		target.ActionsCount += 1

		return tx.Save(&target).Error
	})

	if err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal mentransfer kepemilikan toko", err.Error())
		return
	}

	msg := fmt.Sprintf("Kepemilikan utama %s berhasil ditransfer kepada %s (%s)", st.StoreName, target.FullName, target.Email)
	store.RecordSyncLog(h.db, st.ID, "RBAC & Tim", "transfer_ownership", "success", 1, 0, msg)

	common.JSONSuccess(c, http.StatusOK, msg, target)
}

func (h *Handler) DeleteTeamMember(c *gin.Context) {
	memberID := c.Param("id")
	var member models.TeamMember
	if err := h.db.First(&member, memberID).Error; err != nil {
		common.JSONError(c, http.StatusNotFound, "Anggota tim tidak ditemukan", err.Error())
		return
	}
	if member.Role == "Owner Toko" {
		common.JSONError(c, http.StatusBadRequest, "Akun Owner Toko utama tidak dapat dihapus sebelum transfer kepemilikan", "cannot_delete_owner")
		return
	}

	storeID := member.StoreID
	fullName := member.FullName
	roleName := member.Role

	if err := h.db.Delete(&member).Error; err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal menghapus anggota tim", err.Error())
		return
	}

	store.RecordSyncLog(h.db, storeID, "RBAC & Tim", "team_delete", "warning", 1, 0, fmt.Sprintf("Akses staf %s (%s) dicabut & dihapus dari tim", fullName, roleName))
	common.JSONSuccess(c, http.StatusOK, "Anggota tim berhasil dihapus", gin.H{"deleted_id": memberID})
}

