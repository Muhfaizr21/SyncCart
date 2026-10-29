package products

import (
	"time"

	"github.com/Muhfaizr21/SyncCart/backend/models"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) ListAllProducts() ([]models.Product, error) {
	var list []models.Product
	err := s.db.Order("id ASC").Find(&list).Error
	return list, err
}

func (s *Service) ResolveConflicts(ids []uint) int {
	affected := 0
	for _, id := range ids {
		var prod models.Product
		if err := s.db.First(&prod, id).Error; err == nil {
			prod.ShopeeStock = prod.Stock
			prod.TokopediaStock = prod.Stock
			prod.TikTokStock = prod.Stock
			prod.SyncStatus = "synced"
			prod.LastSyncAt = time.Now()
			_ = s.db.Save(&prod).Error
			affected++
		}
	}
	return affected
}

