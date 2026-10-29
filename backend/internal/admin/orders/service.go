package orders

import (
	"fmt"
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

func (s *Service) ListAllOrders() ([]models.Order, error) {
	var list []models.Order
	err := s.db.Order("id DESC").Find(&list).Error
	return list, err
}

func (s *Service) BulkUpdateOrders(ids []uint, action string) int {
	affected := 0
	for _, id := range ids {
		var ord models.Order
		if err := s.db.First(&ord, id).Error; err != nil {
			continue
		}
		switch action {
		case "mark_shipped":
			ord.Status = "Shipped"
			if ord.TrackingResi == "" {
				ord.TrackingResi = fmt.Sprintf("ADM-AWB-%d", (time.Now().Unix()%89999)+10000)
			}
		case "mark_completed":
			ord.Status = "Completed"
		case "cancel":
			ord.Status = "Cancelled"
		}
		_ = s.db.Save(&ord).Error
		affected++
	}
	return affected
}

