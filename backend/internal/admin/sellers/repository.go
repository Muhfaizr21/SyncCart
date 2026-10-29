package sellers

import (
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"gorm.io/gorm"
)

type Repository interface {
	ListStores() ([]models.Store, error)
	ListUsers() ([]models.User, error)
	ListProducts() ([]models.Product, error)
	ListOrders() ([]models.Order, error)
	ListConnections() ([]models.MarketplaceConnection, error)
	FindStoreByID(id uint) (*models.Store, error)
	FindUserByID(id uint) (*models.User, error)
	CreateUser(u *models.User) error
	SaveUser(u *models.User) error
	CreateStore(st *models.Store) error
	SaveStore(st *models.Store) error
	CreateConnection(conn *models.MarketplaceConnection) error
	CreateInvoice(inv *models.SubscriptionInvoice) error
	SyncStoreProducts(storeID uint) (int, error)
	DeleteStoreCascade(storeID uint) error
	CreateSyncLog(logEntry *models.SyncLog) error
}

type gormRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &gormRepository{db: db}
}

func (r *gormRepository) ListStores() ([]models.Store, error) {
	var list []models.Store
	err := r.db.Order("id ASC").Find(&list).Error
	return list, err
}

func (r *gormRepository) ListUsers() ([]models.User, error) {
	var list []models.User
	err := r.db.Order("id ASC").Find(&list).Error
	return list, err
}

func (r *gormRepository) ListProducts() ([]models.Product, error) {
	var list []models.Product
	err := r.db.Order("id ASC").Find(&list).Error
	return list, err
}

func (r *gormRepository) ListOrders() ([]models.Order, error) {
	var list []models.Order
	err := r.db.Order("id DESC").Find(&list).Error
	return list, err
}

func (r *gormRepository) ListConnections() ([]models.MarketplaceConnection, error) {
	var list []models.MarketplaceConnection
	err := r.db.Order("id ASC").Find(&list).Error
	return list, err
}

func (r *gormRepository) FindStoreByID(id uint) (*models.Store, error) {
	var st models.Store
	if err := r.db.First(&st, id).Error; err != nil {
		return nil, err
	}
	return &st, nil
}

func (r *gormRepository) FindUserByID(id uint) (*models.User, error) {
	var u models.User
	if err := r.db.First(&u, id).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *gormRepository) CreateUser(u *models.User) error {
	return r.db.Create(u).Error
}

func (r *gormRepository) SaveUser(u *models.User) error {
	return r.db.Save(u).Error
}

func (r *gormRepository) CreateStore(st *models.Store) error {
	return r.db.Create(st).Error
}

func (r *gormRepository) SaveStore(st *models.Store) error {
	return r.db.Save(st).Error
}

func (r *gormRepository) CreateConnection(conn *models.MarketplaceConnection) error {
	return r.db.Create(conn).Error
}

func (r *gormRepository) CreateInvoice(inv *models.SubscriptionInvoice) error {
	return r.db.Create(inv).Error
}

func (r *gormRepository) SyncStoreProducts(storeID uint) (int, error) {
	var prods []models.Product
	if err := r.db.Where("store_id = ?", storeID).Find(&prods).Error; err != nil {
		return 0, err
	}
	for i := range prods {
		prods[i].ShopeeStock = prods[i].Stock
		prods[i].TokopediaStock = prods[i].Stock
		prods[i].TikTokStock = prods[i].Stock
		prods[i].SyncStatus = "synced"
		_ = r.db.Save(&prods[i]).Error
	}
	return len(prods), nil
}

func (r *gormRepository) DeleteStoreCascade(storeID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		tx.Where("store_id = ?", storeID).Delete(&models.Product{})
		tx.Where("store_id = ?", storeID).Delete(&models.Order{})
		tx.Where("store_id = ?", storeID).Delete(&models.MarketplaceConnection{})
		tx.Where("store_id = ?", storeID).Delete(&models.TeamMember{})
		tx.Where("store_id = ?", storeID).Delete(&models.SubscriptionInvoice{})
		tx.Where("store_id = ?", storeID).Delete(&models.SyncLog{})
		return tx.Delete(&models.Store{}, storeID).Error
	})
}

func (r *gormRepository) CreateSyncLog(logEntry *models.SyncLog) error {
	return r.db.Create(logEntry).Error
}

