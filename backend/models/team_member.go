package models

import "time"

type TeamMember struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	StoreID     uint      `gorm:"not null;index" json:"store_id"`
	FullName    string    `gorm:"size:120;not null" json:"full_name"`
	Email       string    `gorm:"size:160;not null" json:"email"`
	Role        string    `gorm:"size:60;not null" json:"role"`
	Permissions string    `gorm:"size:500;not null" json:"permissions"`
	Status      string    `gorm:"size:32;default:'active'" json:"status"`
	LastActive  string    `gorm:"size:64" json:"last_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
