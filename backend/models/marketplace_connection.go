package models

import "time"

type MarketplaceConnection struct {
	ID                  uint      `gorm:"primaryKey" json:"id"`
	StoreID             uint      `gorm:"not null;index" json:"store_id"`
	Platform            string    `gorm:"size:50;not null" json:"platform"`
	PlatformSlug        string    `gorm:"size:32;index;default:''" json:"platform_slug"`
	ShopName            string    `gorm:"size:140;not null" json:"shop_name"`
	ShopExternalID      string    `gorm:"size:64;default:''" json:"shop_external_id"`
	Status              string    `gorm:"size:32;default:'connected'" json:"status"`
	EncryptedToken      string    `gorm:"size:256;default:''" json:"encrypted_token"`
	AutoSync            bool      `gorm:"default:true" json:"auto_sync"`
	WebhookEnabled      bool      `gorm:"default:true" json:"webhook_enabled"`
	SyncIntervalMinutes int       `gorm:"default:5" json:"sync_interval_minutes"`
	PriceMarkupPct      float64   `gorm:"default:0" json:"price_markup_pct"`
	ProductsSynced      int       `gorm:"default:0" json:"products_synced"`
	ConflictCount       int       `gorm:"default:0" json:"conflict_count"`
	OrdersThisMonth     int       `gorm:"default:0" json:"orders_this_month"`
	RevenueThisMonth    int64     `gorm:"default:0" json:"revenue_this_month"`
	Rating              string    `gorm:"size:16;default:'4.9'" json:"rating"`
	TokenExpiryDays     int       `gorm:"default:28" json:"token_expiry_days"`
	LastError           string    `gorm:"size:255;default:''" json:"last_error"`
	LastSyncAt          time.Time `json:"last_sync_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
