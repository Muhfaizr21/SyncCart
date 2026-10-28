package models

import "time"

type Product struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	StoreID          uint      `gorm:"not null;index" json:"store_id"`
	SKU              string    `gorm:"size:64;uniqueIndex;not null" json:"sku"`
	Name             string    `gorm:"size:180;not null" json:"name"`
	Description      string    `gorm:"size:500;default:''" json:"description"`
	ImagesJSON       string    `gorm:"type:text;default:'[]'" json:"images_json"`
	Category         string    `gorm:"size:80;not null" json:"category"`
	Warehouse        string    `gorm:"size:120;default:'Gudang Utama Jakarta'" json:"warehouse"`
	WeightGram       int       `gorm:"not null;default:250" json:"weight_gram"`
	Price            int64     `gorm:"not null" json:"price"`
	Stock            int       `gorm:"not null;default:0" json:"stock"`
	SoldCount        int       `gorm:"not null;default:0" json:"sold_count"`
	ShopeeStock      int       `gorm:"not null;default:0" json:"shopee_stock"`
	TokopediaStock   int       `gorm:"not null;default:0" json:"tokopedia_stock"`
	TikTokStock      int       `gorm:"not null;default:0" json:"tiktok_stock"`
	PublishShopee    bool      `gorm:"default:true" json:"publish_shopee"`
	PublishTokopedia bool      `gorm:"default:true" json:"publish_tokopedia"`
	PublishTikTok    bool      `gorm:"default:true" json:"publish_tiktok"`
	SyncStatus       string    `gorm:"size:32;default:'synced'" json:"sync_status"`
	Status           string    `gorm:"size:32;default:'active'" json:"status"`
	AccentTone       string    `gorm:"size:32;default:'sage'" json:"accent_tone"`
	LastSyncAt       time.Time `json:"last_sync_at"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
