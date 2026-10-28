package subscription

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

func (h *Handler) GetSubscriptionInvoices(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var invoices []models.SubscriptionInvoice
	h.db.Where("store_id = ?", st.ID).Order("id DESC").Find(&invoices)

	common.JSONSuccess(c, http.StatusOK, "Berhasil memuat riwayat faktur langganan dari PostgreSQL", gin.H{
		"store":    st,
		"invoices": invoices,
	})
}

func (h *Handler) CheckoutSubscription(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID, _ := userIDVal.(uint)

	st, err := store.ResolveSellerStore(h.db, userID)
	if err != nil {
		common.JSONError(c, http.StatusNotFound, "Toko tidak ditemukan", err.Error())
		return
	}

	var req struct {
		Plan                 string `json:"plan" binding:"required"`
		BillingCycle         string `json:"billing_cycle"`
		ActiveAddons         string `json:"active_addons"`
		PaymentGateway       string `json:"payment_gateway"`
		PaymentAccountMasked string `json:"payment_account_masked"`
		CouponCode           string `json:"coupon_code"`
		AutoRenew            *bool  `json:"auto_renew"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		common.JSONError(c, http.StatusBadRequest, "Paket langganan wajib dipilih", err.Error())
		return
	}

	planKey := strings.ToLower(strings.TrimSpace(req.Plan))
	cycle := strings.ToLower(strings.TrimSpace(req.BillingCycle))
	if cycle != "annual" {
		cycle = "monthly"
	}

	var monthlyBase int64
	var planTitle string
	switch planKey {
	case "free":
		monthlyBase = 0
		planTitle = "Free Trial"
	case "starter":
		monthlyBase = 99000
		planTitle = "Starter"
	case "enterprise":
		monthlyBase = 799000
		planTitle = "Enterprise"
	default:
		planKey = "business"
		monthlyBase = 299000
		planTitle = "Business"
	}

	addonsRaw := strings.TrimSpace(req.ActiveAddons)
	var monthlyAddons int64 = 0
	var addonNames []string
	for _, token := range strings.Split(addonsRaw, ",") {
		switch strings.TrimSpace(token) {
		case "extra_marketplace", "addon_extra_store":
			monthlyAddons += 49000
			addonNames = append(addonNames, "+1 Slot Toko Marketplace")
		case "extra_storage", "addon_extra_sku":
			monthlyAddons += 39000
			addonNames = append(addonNames, "+2.000 Kuota SKU & Cloud WebP")
		case "addon_extra_seats":
			monthlyAddons += 45000
			addonNames = append(addonNames, "+5 Kursi Staf RBAC")
		case "priority_support", "addon_priority_sla":
			monthlyAddons += 65000
			addonNames = append(addonNames, "Priority Webhook & SLA 24/7")
		}
	}

	multiplier := int64(1)
	if cycle == "annual" {
		multiplier = 12
	}

	baseAmount := monthlyBase * multiplier
	addonsAmount := monthlyAddons * multiplier
	grossSubtotal := baseAmount + addonsAmount

	var discountAmount int64 = 0
	if cycle == "annual" && grossSubtotal > 0 {
		discountAmount += (grossSubtotal * 20) / 100
	}

	coupon := strings.ToUpper(strings.TrimSpace(req.CouponCode))
	if (coupon == "SYNCCART10" || coupon == "OMNI10" || coupon == "UMKMJAYA" || coupon == "PROMO10") && grossSubtotal > 0 {
		discountAmount += ((grossSubtotal - discountAmount) * 10) / 100
	} else if coupon == "STARTUP20" && grossSubtotal > 0 {
		discountAmount += ((grossSubtotal - discountAmount) * 20) / 100
	}

	taxable := grossSubtotal - discountAmount
	if taxable < 0 {
		taxable = 0
	}
	taxAmount := (taxable * 11) / 100
	totalAmount := taxable + taxAmount

	gateway := strings.TrimSpace(req.PaymentGateway)
	if gateway == "" {
		gateway = st.PaymentGateway
	}
	if gateway == "" {
		gateway = "Midtrans • BCA Virtual Account"
	}

	masked := strings.TrimSpace(req.PaymentAccountMasked)
	if masked == "" {
		masked = st.PaymentAccountMasked
	}

	now := time.Now()
	periodStart := now.Format("02 Jan 2006")
	periodEnd := now.AddDate(0, 1, 0).Format("02 Jan 2006")
	if cycle == "annual" {
		periodEnd = now.AddDate(1, 0, 0).Format("02 Jan 2006")
	}

	addonsSummary := "Tanpa Add-on Ekstra"
	if len(addonNames) > 0 {
		addonsSummary = strings.Join(addonNames, ", ")
	}

	invNumber := fmt.Sprintf("INV-SUB-%s-%03d", now.Format("200601"), (now.Unix()%900)+100)
	invStatus := "Paid"
	if totalAmount == 0 {
		invStatus = "Free Trial"
	}

	invoice := models.SubscriptionInvoice{
		StoreID:        st.ID,
		InvoiceNumber:  invNumber,
		PlanName:       planTitle,
		BillingCycle:   cycle,
		BaseAmount:     baseAmount,
		AddonsAmount:   addonsAmount,
		DiscountAmount: discountAmount,
		TaxAmount:      taxAmount,
		TotalAmount:    totalAmount,
		PaymentGateway: gateway,
		AddonsSummary:  addonsSummary,
		PeriodStart:    periodStart,
		PeriodEnd:      periodEnd,
		Status:         invStatus,
		CreatedAt:      now,
	}

	st.Plan = planKey
	st.BillingCycle = cycle
	st.ActiveAddons = addonsRaw
	st.PaymentGateway = gateway
	if masked != "" {
		st.PaymentAccountMasked = masked
	}
	st.CouponCode = coupon
	st.SubscriptionRenewsAt = periodEnd
	if req.AutoRenew != nil {
		st.AutoRenew = *req.AutoRenew
	}

	err = h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(st).Error; err != nil {
			return err
		}
		return tx.Create(&invoice).Error
	})
	if err != nil {
		common.JSONError(c, http.StatusInternalServerError, "Gagal memproses pembayaran paket langganan", err.Error())
		return
	}

	store.RecordSyncLog(
		h.db,
		st.ID,
		"Billing & SaaS",
		"subscription_checkout",
		"success",
		1,
		0,
		fmt.Sprintf("Faktur %s diterbitkan: Paket %s (%s) senilai Rp %d via %s", invNumber, planTitle, cycle, totalAmount, gateway),
	)

	common.JSONSuccess(c, http.StatusCreated, "Pembayaran langganan berhasil diproses & faktur diterbitkan di PostgreSQL", gin.H{
		"store":   st,
		"invoice": invoice,
	})
}
