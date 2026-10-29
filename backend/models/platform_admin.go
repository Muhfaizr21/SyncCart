package models

import "time"

type PlatformCoupon struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Code            string    `gorm:"size:60;uniqueIndex;not null" json:"code"`
	Description     string    `gorm:"size:180;not null" json:"description"`
	DiscountPercent int       `gorm:"not null;default:10" json:"discount_percent"`
	MaxUses         int       `gorm:"not null;default:100" json:"max_uses"`
	UsedCount       int       `gorm:"not null;default:0" json:"used_count"`
	ApplicablePlans string    `gorm:"size:120;not null;default:'starter,business,enterprise'" json:"applicable_plans"`
	ExpiresAt       string    `gorm:"size:40;not null;default:'31 Des 2026'" json:"expires_at"`
	Status          string    `gorm:"size:32;not null;default:'active'" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type PlatformSetting struct {
	ID                       uint      `gorm:"primaryKey" json:"id"`
	PlatformName             string    `gorm:"size:120;not null;default:'SyncCart Enterprise Cloud'" json:"platform_name"`
	SupportEmail             string    `gorm:"size:160;not null;default:'ops@synccart.id'" json:"support_email"`
	SupportPhone             string    `gorm:"size:60;not null;default:'+62 21 5088 9900'" json:"support_phone"`
	OfficeAddress            string    `gorm:"size:255;not null;default:'Menara Sudirman Lt. 18, SCBD Jakarta Selatan'" json:"office_address"`
	ShopeePartnerID          string    `gorm:"size:120;not null;default:'SHP-PARTNER-2009841'" json:"shopee_partner_id"`
	ShopeePartnerKeyMasked   string    `gorm:"size:140;not null;default:'shp_partner_live_••••_9921'" json:"shopee_partner_key_masked"`
	ShopeeRateLimitPerMin    int       `gorm:"not null;default:1200" json:"shopee_rate_limit_per_min"`
	TokopediaAppID           string    `gorm:"size:120;not null;default:'TKP-FS-884120'" json:"tokopedia_app_id"`
	TokopediaSecretMasked    string    `gorm:"size:140;not null;default:'tkp_fs_secret_••••_4410'" json:"tokopedia_secret_masked"`
	TokopediaRateLimitPerMin int       `gorm:"not null;default:1000" json:"tokopedia_rate_limit_per_min"`
	TikTokAppKey             string    `gorm:"size:120;not null;default:'TTS-OPEN-661920'" json:"tiktok_app_key"`
	TikTokSecretMasked       string    `gorm:"size:140;not null;default:'tts_open_live_••••_7732'" json:"tiktok_secret_masked"`
	TikTokRateLimitPerMin    int       `gorm:"not null;default:900" json:"tiktok_rate_limit_per_min"`
	CommissionStarterPct     float64   `gorm:"not null;default:1.5" json:"commission_starter_pct"`
	CommissionBusinessPct    float64   `gorm:"not null;default:1.0" json:"commission_business_pct"`
	CommissionEnterprisePct  float64   `gorm:"not null;default:0.5" json:"commission_enterprise_pct"`
	MaintenanceMode          bool      `gorm:"not null;default:false" json:"maintenance_mode"`
	AutoSuspendUnpaidDays    int       `gorm:"not null;default:3" json:"auto_suspend_unpaid_days"`
	UpdatedAt                time.Time `json:"updated_at"`
}

