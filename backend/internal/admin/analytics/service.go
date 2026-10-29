package analytics

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

func (s *Service) ListMarketplaceConnections() ([]models.MarketplaceConnection, error) {
	var list []models.MarketplaceConnection
	err := s.db.Order("id ASC").Find(&list).Error
	return list, err
}

