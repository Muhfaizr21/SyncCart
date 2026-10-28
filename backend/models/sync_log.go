package models

import "time"

type SyncLog struct {
	ID                uint      `gorm:"primaryKey" json:"id"`
	StoreID           uint      `gorm:"not null;index" json:"store_id"`
	Platform          string    `gorm:"size:50;not null" json:"platform"`
	ActionType        string    `gorm:"size:64;not null" json:"action_type"` // manual_sync | oauth_connect | oauth_disconnect | token_refresh | webhook_order | webhook_stock | settings_update
	Status            string    `gorm:"size:32;not null" json:"status"`      // success | warning | error
	ItemsSynced       int       `gorm:"default:0" json:"items_synced"`
	ConflictsResolved int       `gorm:"default:0" json:"conflicts_resolved"`
	DurationMs        int       `gorm:"default:120" json:"duration_ms"`
	Message           string    `gorm:"size:300;not null" json:"message"`
	CreatedAt         time.Time `json:"created_at"`
}

