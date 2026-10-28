package models

import "time"

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	FullName     string    `gorm:"size:120;not null" json:"full_name"`
	Email        string    `gorm:"size:160;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	Role         string    `gorm:"size:32;not null;default:'seller'" json:"role"`
	Status       string    `gorm:"size:32;not null;default:'active'" json:"status"`
	Stores       []Store   `gorm:"foreignKey:OwnerID" json:"stores,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

