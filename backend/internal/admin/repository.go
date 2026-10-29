package admin

import (
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"gorm.io/gorm"
)

// Repository defines the data-access contract for SuperAdmin operations (SOLID: Dependency Inversion).
type Repository interface {
	ListAllUsers() ([]models.User, error)
	FindUserByID(id uint) (*models.User, error)
	CreateUser(user *models.User) error
	SaveUser(user *models.User) error

	ListAllStores() ([]models.Store, error)
	FindStoreByID(id uint) (*models.Store, error)
	CreateStore(st *models.Store) error
	SaveStore(st *models.Store) error
	DeleteStoreCascade(storeID uint) error

	ListAllProducts() ([]models.Product, error)
	FindProductByID(id uint) (*models.Product, error)
	SaveProduct(p *models.Product) error
	DeleteProduct(id uint) error

	ListAllOrders() ([]models.Order, error)
	FindOrderByID(id uint) (*models.Order, error)
	SaveOrder(o *models.Order) error

	ListAllMarketplaceConnections() ([]models.MarketplaceConnection, error)
	CreateMarketplaceConnections(conns []models.MarketplaceConnection) error

	ListAllInvoices() ([]models.SubscriptionInvoice, error)
	ListRecentSyncLogs(limit int) ([]models.SyncLog, error)
	CreateSyncLog(entry *models.SyncLog) error

	ListAllCoupons() ([]models.PlatformCoupon, error)
	CreateCoupon(coupon *models.PlatformCoupon) error
	DeleteCoupon(id uint) error

	GetPlatformSettings() (*models.PlatformSetting, error)
	SavePlatformSettings(cfg *models.PlatformSetting) error
}

type gormRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &gormRepository{db: db}
}

func (r *gormRepository) ListAllUsers() ([]models.User, error) {
	var users []models.User
	err := r.db.Preload("Stores").Order("id ASC").Find(&users).Error
	return users, err
}

func (r *gormRepository) FindUserByID(id uint) (*models.User, error) {
	var u models.User
	if err := r.db.First(&u, id).Error; err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *gormRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *gormRepository) SaveUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *gormRepository) ListAllStores() ([]models.Store, error) {
	var stores []models.Store
	err := r.db.Order("id ASC").Find(&stores).Error
	return stores, err
}

func (r *gormRepository) FindStoreByID(id uint) (*models.Store, error) {
	var st models.Store
	if err := r.db.First(&st, id).Error; err != nil {
		return nil, err
	}
	return &st, nil
}

func (r *gormRepository) CreateStore(st *models.Store) error {
	return r.db.Create(st).Error
}

func (r *gormRepository) SaveStore(st *models.Store) error {
	return r.db.Save(st).Error
}

func (r *gormRepository) DeleteStoreCascade(storeID uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		tx.Where("store_id = ?", storeID).Delete(&models.Order{})
		tx.Where("store_id = ?", storeID).Delete(&models.Product{})
		tx.Where("store_id = ?", storeID).Delete(&models.MarketplaceConnection{})
		tx.Where("store_id = ?", storeID).Delete(&models.TeamMember{})
		tx.Where("store_id = ?", storeID).Delete(&models.SubscriptionInvoice{})
		tx.Where("store_id = ?", storeID).Delete(&models.SyncLog{})
		return tx.Delete(&models.Store{}, storeID).Error
	})
}

func (r *gormRepository) ListAllProducts() ([]models.Product, error) {
	var products []models.Product
	err := r.db.Order("sold_count DESC, id ASC").Find(&products).Error
	return products, err
}

func (r *gormRepository) FindProductByID(id uint) (*models.Product, error) {
	var p models.Product
	if err := r.db.First(&p, id).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *gormRepository) SaveProduct(p *models.Product) error {
	return r.db.Save(p).Error
}

func (r *gormRepository) DeleteProduct(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}

func (r *gormRepository) ListAllOrders() ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Order("id DESC").Find(&orders).Error
	return orders, err
}

func (r *gormRepository) FindOrderByID(id uint) (*models.Order, error) {
	var o models.Order
	if err := r.db.First(&o, id).Error; err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *gormRepository) SaveOrder(o *models.Order) error {
	return r.db.Save(o).Error
}

func (r *gormRepository) ListAllMarketplaceConnections() ([]models.MarketplaceConnection, error) {
	var conns []models.MarketplaceConnection
	err := r.db.Order("id ASC").Find(&conns).Error
	return conns, err
}

func (r *gormRepository) CreateMarketplaceConnections(conns []models.MarketplaceConnection) error {
	return r.db.Create(&conns).Error
}

func (r *gormRepository) ListAllInvoices() ([]models.SubscriptionInvoice, error) {
	var invoices []models.SubscriptionInvoice
	err := r.db.Order("id DESC").Find(&invoices).Error
	return invoices, err
}

func (r *gormRepository) ListRecentSyncLogs(limit int) ([]models.SyncLog, error) {
	var logs []models.SyncLog
	err := r.db.Order("id DESC").Limit(limit).Find(&logs).Error
	return logs, err
}

func (r *gormRepository) CreateSyncLog(entry *models.SyncLog) error {
	return r.db.Create(entry).Error
}

func (r *gormRepository) ListAllCoupons() ([]models.PlatformCoupon, error) {
	var coupons []models.PlatformCoupon
	err := r.db.Order("id ASC").Find(&coupons).Error
	return coupons, err
}

func (r *gormRepository) CreateCoupon(coupon *models.PlatformCoupon) error {
	return r.db.Create(coupon).Error
}

func (r *gormRepository) DeleteCoupon(id uint) error {
	return r.db.Delete(&models.PlatformCoupon{}, id).Error
}

func (r *gormRepository) GetPlatformSettings() (*models.PlatformSetting, error) {
	var cfg models.PlatformSetting
	if err := r.db.Order("id ASC").First(&cfg).Error; err != nil {
		return nil, err
	}
	return &cfg, nil
}

func (r *gormRepository) SavePlatformSettings(cfg *models.PlatformSetting) error {
	return r.db.Save(cfg).Error
}

