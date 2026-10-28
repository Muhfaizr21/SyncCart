package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/auth"
	"github.com/Muhfaizr21/SyncCart/backend/internal/seller"
	"github.com/gin-gonic/gin"
)

func RegisterSellerRoutes(router *gin.Engine, sellerHandler *seller.Handler, authService *auth.Service) {
	api := router.Group("/api")
	api.Use(auth.JWTMiddleware(authService))
	{
		api.GET("/seller/overview", sellerHandler.GetOverview)

		// Products & Omnichannel Stock Sync (Phase 5 FITUR.MD)
		api.POST("/products", sellerHandler.CreateProduct)
		api.PATCH("/products/:id/stock", sellerHandler.UpdateProductStock)
		api.POST("/products/sync-stock", sellerHandler.SyncAllProductsStock)
		api.DELETE("/products/:id", sellerHandler.DeleteProduct)

		// Orders & Resi Processing (Phase 6 FITUR.MD)
		api.POST("/orders/:id/ship", sellerHandler.UpdateOrderShipping)

		// Marketplace Integration (Phase 4 FITUR.MD - Full OAuth, Sync, Settings, Logs, Webhooks)
		api.GET("/marketplace", sellerHandler.GetMarketplaceData)
		api.POST("/marketplace/:id/connect", sellerHandler.ConnectMarketplace)
		api.POST("/marketplace/:id/disconnect", sellerHandler.DisconnectMarketplace)
		api.POST("/marketplace/:id/sync", sellerHandler.SyncSingleMarketplace)
		api.PATCH("/marketplace/:id/settings", sellerHandler.UpdateMarketplaceSettings)
		api.POST("/marketplace/:id/action", sellerHandler.ToggleMarketplace)
		api.POST("/marketplace/webhooks/simulate", sellerHandler.SimulateMarketplaceWebhook)

		// Team & RBAC Management (Phase 8 FITUR.MD)
		api.POST("/team/invite", sellerHandler.InviteTeamMember)
		api.PATCH("/team/:id/permissions", sellerHandler.UpdateTeamPermissions)
		api.DELETE("/team/:id", sellerHandler.DeleteTeamMember)

		// Store Settings & Subscription Upgrade (Phase 9 & 10 FITUR.MD)
		api.PATCH("/stores/settings", sellerHandler.UpdateStoreSettings)
	}
}
