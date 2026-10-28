package models

import "time"

type Product struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	StoreID        uint      `gorm:"not null;index" json:"store_id"`
	SKU            string    `gorm:"size:64;uniqueIndex;not null" json:"sku"`
	Name           string    `gorm:"size:180;not null" json:"name"`
	Category       string    `gorm:"size:80;not null" json:"category"`
	Warehouse      string    `gorm:"size:120;default:'Gudang Utama Jakarta'" json:"warehouse"`
	Price          int64     `gorm:"not null" json:"price"`
	Stock          int       `gorm:"not null;default:0" json:"stock"`
	SoldCount      int       `gorm:"not null;default:0" json:"sold_count"`
	ShopeeStock    int       `gorm:"not null;default:0" json:"shopee_stock"`
	TokopediaStock int       `gorm:"not null;default:0" json:"tokopedia_stock"`
	TikTokStock    int       `gorm:"not null;default:0" json:"tiktok_stock"`
	SyncStatus     string    `gorm:"size:32;default:'synced'" json:"sync_status"`
	Status         string    `gorm:"size:32;default:'active'" json:"status"`
	AccentTone     string    `gorm:"size:32;default:'sage'" json:"accent_tone"`
	LastSyncAt     time.Time `json:"last_sync_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
