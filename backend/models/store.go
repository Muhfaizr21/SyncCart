package models

import "time"

type Store struct {
	ID                      uint      `gorm:"primaryKey" json:"id"`
	OwnerID                 uint      `gorm:"index;not null" json:"owner_id"`
	StoreName               string    `gorm:"size:140;not null" json:"store_name"`
	StoreSlug               string    `gorm:"size:140;not null;default:'toko-nusantara-official'" json:"store_slug"`
	BusinessCategory        string    `gorm:"size:120;not null;default:'Fashion & Apparel Omnichannel'" json:"business_category"`
	SupportPhone            string    `gorm:"size:60;not null;default:'+62 812-8890-4412'" json:"support_phone"`
	SupportEmail            string    `gorm:"size:160;not null;default:'cs@tokonusantara.id'" json:"support_email"`
	TaxNPWP                 string    `gorm:"size:64;not null;default:'09.254.294.3-042.000'" json:"tax_npwp"`
	Plan                    string    `gorm:"size:40;not null;default:'free'" json:"plan"`
	BillingCycle            string    `gorm:"size:32;not null;default:'monthly'" json:"billing_cycle"`
	AutoRenew               bool      `gorm:"not null;default:true" json:"auto_renew"`
	PaymentGateway          string    `gorm:"size:120;not null;default:'Midtrans • BCA Virtual Account'" json:"payment_gateway"`
	PaymentAccountMasked    string    `gorm:"size:140;not null;default:'VA 88012 •••• 9921 (PT Nusantara Retail)'" json:"payment_account_masked"`
	ActiveAddons            string    `gorm:"size:255;not null;default:''" json:"active_addons"`
	CouponCode              string    `gorm:"size:60;not null;default:''" json:"coupon_code"`
	SubscriptionRenewsAt    string    `gorm:"size:64;not null;default:'28 Nov 2026'" json:"subscription_renews_at"`
	ConnectedChannels       string    `gorm:"size:255;not null;default:'Shopee,Tokopedia,TikTok Shop'" json:"connected_channels"`
	PlatformFeePercent      float64   `gorm:"not null;default:6.5" json:"platform_fee_percent"`
	OperationalCogsPercent  float64   `gorm:"not null;default:42.0" json:"operational_cogs_percent"`
	TaxPercent              float64   `gorm:"not null;default:0.5" json:"tax_percent"`
	ReportScheduleEmail     string    `gorm:"size:160;not null;default:'seller@synccart.id'" json:"report_schedule_email"`
	ReportScheduleFrequency string    `gorm:"size:40;not null;default:'weekly'" json:"report_schedule_frequency"`
	WarehouseName           string    `gorm:"size:140;not null;default:'Gudang Pusat Sunter Hub A1'" json:"warehouse_name"`
	WarehouseAddress        string    `gorm:"size:255;not null;default:'Jl. Danau Sunter Utara Blok G-12, Jakarta Utara 14350'" json:"warehouse_address"`
	WarehouseCity           string    `gorm:"size:120;not null;default:'Jakarta Utara, DKI Jakarta'" json:"warehouse_city"`
	WarehousePostal         string    `gorm:"size:24;not null;default:'14350'" json:"warehouse_postal"`
	PickupCutoffTime        string    `gorm:"size:40;not null;default:'16:00 WIB'" json:"pickup_cutoff_time"`
	ActiveCouriers          string    `gorm:"size:255;not null;default:'jne,jnt,sicepat,spx,gosend'" json:"active_couriers"`
	ThermalPaperSize        string    `gorm:"size:40;not null;default:'A6_100x150'" json:"thermal_paper_size"`
	AutoPrintLabel          bool      `gorm:"not null;default:true" json:"auto_print_label"`
	LowStockThreshold       int       `gorm:"not null;default:10" json:"low_stock_threshold"`
	SafetyStockBuffer       int       `gorm:"not null;default:2" json:"safety_stock_buffer"`
	AutoZeroOutOfStock      bool      `gorm:"not null;default:true" json:"auto_zero_out_of_stock"`
	SyncIntervalMinutes     int       `gorm:"not null;default:5" json:"sync_interval_minutes"`
	NotificationPrefs       string    `gorm:"size:255;not null;default:'order_received,low_stock,token_expiry,webhook_failure,security_login'" json:"notification_prefs"`
	WebhookEndpointURL      string    `gorm:"size:255;not null;default:'https://erp.tokonusantara.id/webhooks/synccart'" json:"webhook_endpoint_url"`
	WebhookSecretKey        string    `gorm:"size:120;not null;default:'whsec_synccart_live_98f2a4c7e1b0'" json:"webhook_secret_key"`
	OpenAPIKeyMasked        string    `gorm:"size:120;not null;default:'sk_live_synccart_8821_9904a7d2'" json:"open_api_key_masked"`
	TwoFactorEnforced       bool      `gorm:"not null;default:true" json:"two_factor_enforced"`
	Status                  string    `gorm:"size:32;not null;default:'active'" json:"status"`
	CreatedAt               time.Time `json:"created_at"`
	UpdatedAt               time.Time `json:"updated_at"`
}
