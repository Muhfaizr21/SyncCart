package models

import "time"

type TeamMember struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	StoreID          uint      `gorm:"not null;index" json:"store_id"`
	FullName         string    `gorm:"size:120;not null" json:"full_name"`
	Email            string    `gorm:"size:160;not null" json:"email"`
	Phone            string    `gorm:"size:40;not null;default:'-'" json:"phone"`
	Department       string    `gorm:"size:80;not null;default:'Operasional & Order'" json:"department"`
	Role             string    `gorm:"size:60;not null" json:"role"`
	Permissions      string    `gorm:"size:500;not null" json:"permissions"`
	AssignedChannels string    `gorm:"size:255;not null;default:'Shopee,Tokopedia,TikTok Shop'" json:"assigned_channels"`
	TwoFactorEnabled bool      `gorm:"not null;default:true" json:"two_factor_enabled"`
	SessionDevice    string    `gorm:"size:140;not null;default:'MacBook Pro • Chrome 130 (Jakarta)'" json:"session_device"`
	SessionIP        string    `gorm:"size:64;not null;default:'103.144.22.18'" json:"session_ip"`
	InviteExpiresAt  string    `gorm:"size:64;not null;default:'Terverifikasi'" json:"invite_expires_at"`
	ActionsCount     int       `gorm:"not null;default:18" json:"actions_count"`
	Status           string    `gorm:"size:32;default:'active'" json:"status"`
	LastActive       string    `gorm:"size:64" json:"last_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}
