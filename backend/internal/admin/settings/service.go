package settings

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

func (s *Service) GetPlatformSettings() (*models.PlatformSetting, error) {
	var cfg models.PlatformSetting
	if err := s.db.Order("id ASC").First(&cfg).Error; err != nil {
		return nil, err
	}
	return &cfg, nil
}

