package subscriptions

import (
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) ListInvoices() ([]models.SubscriptionInvoice, error) {
	var list []models.SubscriptionInvoice
	err := s.db.Order("id DESC").Find(&list).Error
	return list, err
}

func (s *Service) ListCoupons() ([]models.PlatformCoupon, error) {
	var list []models.PlatformCoupon
	err := s.db.Order("id ASC").Find(&list).Error
	return list, err
}

