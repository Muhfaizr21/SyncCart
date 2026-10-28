package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/marketplace"
	"github.com/gin-gonic/gin"
)

func RegisterMarketplaceRoutes(rg *gin.RouterGroup, marketplaceHandler *marketplace.Handler) {
	rg.GET("/marketplace", marketplaceHandler.GetMarketplaceData)
	rg.POST("/marketplace/:id/connect", marketplaceHandler.ConnectMarketplace)
	rg.POST("/marketplace/:id/disconnect", marketplaceHandler.DisconnectMarketplace)
	rg.POST("/marketplace/:id/sync", marketplaceHandler.SyncSingleMarketplace)
	rg.PATCH("/marketplace/:id/settings", marketplaceHandler.UpdateMarketplaceSettings)
	rg.POST("/marketplace/:id/action", marketplaceHandler.ToggleMarketplace)
	rg.POST("/marketplace/webhooks/simulate", marketplaceHandler.SimulateMarketplaceWebhook)
}

