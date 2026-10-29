package users

import (
	"strings"

	"github.com/Muhfaizr21/SyncCart/backend/models"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) ListUsers() ([]models.User, error) {
	var list []models.User
	err := s.db.Order("id ASC").Find(&list).Error
	return list, err
}

func (s *Service) UpdateRole(userID uint, role, status string) (*models.User, error) {
	var u models.User
	if err := s.db.First(&u, userID).Error; err != nil {
		return nil, err
	}
	if strings.TrimSpace(role) != "" {
		u.Role = strings.ToLower(strings.TrimSpace(role))
	}
	if strings.TrimSpace(status) != "" {
		u.Status = strings.ToLower(strings.TrimSpace(status))
	}
	if err := s.db.Save(&u).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

