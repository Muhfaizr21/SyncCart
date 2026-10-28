package models

import "time"

type Store struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	OwnerID           uint      `gorm:"index;not null" json:"owner_id"`
	StoreName         string    `gorm:"size:140;not null" json:"store_name"`
	Plan              string    `gorm:"size:40;not null;default:'free'" json:"plan"`
	ConnectedChannels string    `gorm:"size:255;not null;default:'Shopee,Tokopedia,TikTok Shop'" json:"connected_channels"`
	Status            string    `gorm:"size:32;not null;default:'active'" json:"status"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

