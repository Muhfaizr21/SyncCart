package models

import "time"

type Order struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	StoreID         uint      `gorm:"not null;index" json:"store_id"`
	OrderNumber     string    `gorm:"size:64;uniqueIndex;not null" json:"order_number"`
	PaymentCode     string    `gorm:"size:32;not null" json:"payment_code"`
	Marketplace     string    `gorm:"size:50;not null" json:"marketplace"`
	BuyerName       string    `gorm:"size:120;not null" json:"buyer_name"`
	BuyerPhone      string    `gorm:"size:40;default:'0812-8890-4412'" json:"buyer_phone"`
	ShippingAddress string    `gorm:"size:255;default:'Jl. Sudirman No. 45, Jakarta Selatan'" json:"shipping_address"`
	PaymentMethod   string    `gorm:"size:50;default:'QRIS / Virtual Account'" json:"payment_method"`
	Notes           string    `gorm:"size:255;default:''" json:"notes"`
	BuyerInitials   string    `gorm:"size:8;not null" json:"buyer_initials"`
	ProductName     string    `gorm:"size:180;not null" json:"product_name"`
	ProductSKU      string    `gorm:"size:64;not null" json:"product_sku"`
	PropertySub     string    `gorm:"size:160;not null" json:"property_sub"`
	Quantity        int       `gorm:"not null;default:1" json:"quantity"`
	Amount          int64     `gorm:"not null" json:"amount"`
	Courier         string    `gorm:"size:80;not null" json:"courier"`
	TrackingResi    string    `gorm:"size:80" json:"tracking_resi"`
	Status          string    `gorm:"size:32;default:'Pending'" json:"status"`
	SLADeadline     string    `gorm:"size:64" json:"sla_deadline"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
