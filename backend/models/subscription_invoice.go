package models

import "time"

type SubscriptionInvoice struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	StoreID        uint      `gorm:"not null;index" json:"store_id"`
	InvoiceNumber  string    `gorm:"size:64;uniqueIndex;not null" json:"invoice_number"`
	PlanName       string    `gorm:"size:60;not null" json:"plan_name"`
	BillingCycle   string    `gorm:"size:32;not null;default:'monthly'" json:"billing_cycle"`
	BaseAmount     int64     `gorm:"not null;default:0" json:"base_amount"`
	AddonsAmount   int64     `gorm:"not null;default:0" json:"addons_amount"`
	DiscountAmount int64     `gorm:"not null;default:0" json:"discount_amount"`
	TaxAmount      int64     `gorm:"not null;default:0" json:"tax_amount"`
	TotalAmount    int64     `gorm:"not null;default:0" json:"total_amount"`
	PaymentGateway string    `gorm:"size:120;not null;default:'Midtrans • BCA Virtual Account'" json:"payment_gateway"`
	AddonsSummary  string    `gorm:"size:255;not null;default:'-'" json:"addons_summary"`
	PeriodStart    string    `gorm:"size:40;not null" json:"period_start"`
	PeriodEnd      string    `gorm:"size:40;not null" json:"period_end"`
	Status         string    `gorm:"size:32;not null;default:'Paid'" json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
