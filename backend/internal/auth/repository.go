package auth

import (
	"strings"

	"github.com/Muhfaizr21/SyncCart/backend/models"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	normalized := strings.ToLower(strings.TrimSpace(email))
	if err := r.db.Preload("Stores").Where("LOWER(email) = ?", normalized).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) FindByID(id uint) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Stores").First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) CreateSellerWithStore(user *models.User, storeName string, channels string) (*models.User, error) {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(user).Error; err != nil {
			return err
		}

		if strings.TrimSpace(storeName) == "" {
			storeName = "Toko " + user.FullName
		}
		if strings.TrimSpace(channels) == "" {
			channels = "Shopee,Tokopedia,TikTok Shop"
		}

		store := models.Store{
			OwnerID:           user.ID,
			StoreName:         strings.TrimSpace(storeName),
			Plan:              "free",
			ConnectedChannels: channels,
			Status:            "active",
		}
		return tx.Create(&store).Error
	})
	if err != nil {
		return nil, err
	}

	return r.FindByID(user.ID)
}

func (r *Repository) ListAllUsers() ([]models.User, error) {
	var users []models.User
	if err := r.db.Preload("Stores").Order("id ASC").Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

