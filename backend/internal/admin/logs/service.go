package logs

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

func (s *Service) ListRecentLogs(limit int) ([]models.SyncLog, error) {
	var list []models.SyncLog
	err := s.db.Order("id DESC").Limit(limit).Find(&list).Error
	return list, err
}

