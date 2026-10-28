package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/store"
	"github.com/gin-gonic/gin"
)

func RegisterStoreRoutes(rg *gin.RouterGroup, storeHandler *store.Handler) {
	rg.GET("/seller/overview", storeHandler.GetOverview)
	rg.GET("/stores", storeHandler.GetOverview)
	rg.PATCH("/stores/settings", storeHandler.UpdateStoreSettings)
	rg.POST("/stores/rotate-keys", storeHandler.RotateStoreAPIKeys)
	rg.POST("/stores/test-webhook", storeHandler.TestStoreWebhookPing)
}
