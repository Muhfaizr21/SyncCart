package seller

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/marketplace"
	"github.com/Muhfaizr21/SyncCart/backend/internal/order"
	"github.com/Muhfaizr21/SyncCart/backend/internal/product"
	"github.com/Muhfaizr21/SyncCart/backend/internal/report"
	"github.com/Muhfaizr21/SyncCart/backend/internal/store"
	"github.com/Muhfaizr21/SyncCart/backend/internal/subscription"
	"github.com/Muhfaizr21/SyncCart/backend/internal/team"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Handler composes the domain-specific handlers (store, marketplace, product,
// order, report, team, subscription) following SOLID Single-Responsibility and
// the modular architecture defined in FITUR.MD.
type Handler struct {
	Store        *store.Handler
	Marketplace  *marketplace.Handler
	Product      *product.Handler
	Order        *order.Handler
	Report       *report.Handler
	Team         *team.Handler
	Subscription *subscription.Handler
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{
		Store:        store.NewHandler(db),
		Marketplace:  marketplace.NewHandler(db),
		Product:      product.NewHandler(db),
		Order:        order.NewHandler(db),
		Report:       report.NewHandler(db),
		Team:         team.NewHandler(db),
		Subscription: subscription.NewHandler(db),
	}
}

// Store & Overview Delegation
func (h *Handler) GetOverview(c *gin.Context)          { h.Store.GetOverview(c) }
func (h *Handler) UpdateStoreSettings(c *gin.Context)  { h.Store.UpdateStoreSettings(c) }
func (h *Handler) RotateStoreAPIKeys(c *gin.Context)   { h.Store.RotateStoreAPIKeys(c) }
func (h *Handler) TestStoreWebhookPing(c *gin.Context) { h.Store.TestStoreWebhookPing(c) }

// Marketplace Delegation
func (h *Handler) GetMarketplaceData(c *gin.Context)         { h.Marketplace.GetMarketplaceData(c) }
func (h *Handler) ConnectMarketplace(c *gin.Context)         { h.Marketplace.ConnectMarketplace(c) }
func (h *Handler) DisconnectMarketplace(c *gin.Context)      { h.Marketplace.DisconnectMarketplace(c) }
func (h *Handler) SyncSingleMarketplace(c *gin.Context)      { h.Marketplace.SyncSingleMarketplace(c) }
func (h *Handler) UpdateMarketplaceSettings(c *gin.Context)  { h.Marketplace.UpdateMarketplaceSettings(c) }
func (h *Handler) ToggleMarketplace(c *gin.Context)          { h.Marketplace.ToggleMarketplace(c) }
func (h *Handler) SimulateMarketplaceWebhook(c *gin.Context) { h.Marketplace.SimulateMarketplaceWebhook(c) }

// Product Delegation
func (h *Handler) CreateProduct(c *gin.Context)        { h.Product.CreateProduct(c) }
func (h *Handler) UpdateProduct(c *gin.Context)        { h.Product.UpdateProduct(c) }
func (h *Handler) DuplicateProduct(c *gin.Context)     { h.Product.DuplicateProduct(c) }
func (h *Handler) BulkProductAction(c *gin.Context)    { h.Product.BulkProductAction(c) }
func (h *Handler) UpdateProductStock(c *gin.Context)   { h.Product.UpdateProductStock(c) }
func (h *Handler) SyncAllProductsStock(c *gin.Context) { h.Product.SyncAllProductsStock(c) }
func (h *Handler) DeleteProduct(c *gin.Context)        { h.Product.DeleteProduct(c) }

// Order Delegation
func (h *Handler) CreateManualOrder(c *gin.Context)     { h.Order.CreateManualOrder(c) }
func (h *Handler) UpdateOrderShipping(c *gin.Context)   { h.Order.UpdateOrderShipping(c) }
func (h *Handler) BulkOrderAction(c *gin.Context)       { h.Order.BulkOrderAction(c) }
func (h *Handler) DeleteOrder(c *gin.Context)           { h.Order.DeleteOrder(c) }

// Report Delegation
func (h *Handler) GetReportSummary(c *gin.Context) { h.Report.GetReportSummary(c) }

// Team & RBAC Delegation
func (h *Handler) InviteTeamMember(c *gin.Context)       { h.Team.InviteTeamMember(c) }
func (h *Handler) UpdateTeamPermissions(c *gin.Context)  { h.Team.UpdateTeamPermissions(c) }
func (h *Handler) TeamSessionAction(c *gin.Context)      { h.Team.TeamSessionAction(c) }
func (h *Handler) TransferStoreOwnership(c *gin.Context) { h.Team.TransferStoreOwnership(c) }
func (h *Handler) DeleteTeamMember(c *gin.Context)       { h.Team.DeleteTeamMember(c) }

// Subscription & Billing Delegation
func (h *Handler) GetSubscriptionInvoices(c *gin.Context) { h.Subscription.GetSubscriptionInvoices(c) }
func (h *Handler) CheckoutSubscription(c *gin.Context)    { h.Subscription.CheckoutSubscription(c) }
