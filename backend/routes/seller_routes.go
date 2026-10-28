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
		RegisterStoreRoutes(api, sellerHandler.Store)
		RegisterProductRoutes(api, sellerHandler.Product)
		RegisterOrderRoutes(api, sellerHandler.Order)
		RegisterMarketplaceRoutes(api, sellerHandler.Marketplace)
		RegisterReportRoutes(api, sellerHandler.Report)
		RegisterTeamRoutes(api, sellerHandler.Team)
		RegisterSubscriptionRoutes(api, sellerHandler.Subscription)
	}
}
