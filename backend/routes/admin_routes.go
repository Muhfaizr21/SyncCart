package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/config"
	"github.com/Muhfaizr21/SyncCart/backend/internal/admin"
	"github.com/Muhfaizr21/SyncCart/backend/internal/auth"
	"github.com/gin-gonic/gin"
)

func RegisterAdminRoutes(router *gin.Engine, adminHandler *admin.Handler, authService *auth.Service) {
	adminGroup := router.Group("/api/admin")
	adminGroup.Use(auth.JWTMiddleware(authService), auth.RequireRole(config.RoleSuperAdmin))
	{
		adminGroup.GET("/overview", adminHandler.GetOverview)
		adminGroup.GET("/dashboard/summary", adminHandler.GetOverview)
		adminGroup.GET("/sellers", adminHandler.GetOverview)
		adminGroup.POST("/sellers", adminHandler.CreateSeller)
		adminGroup.PATCH("/sellers/:id", adminHandler.UpdateSellerProfile)
		adminGroup.PATCH("/sellers/:id/status", adminHandler.UpdateSellerStatus)
		adminGroup.PATCH("/sellers/:id/plan", adminHandler.UpdateSellerPlan)
		adminGroup.POST("/sellers/:id/sync", adminHandler.SyncSellerCatalog)
		adminGroup.DELETE("/sellers/:id", adminHandler.DeleteSeller)
		adminGroup.POST("/bulk-action", adminHandler.BulkAction)
		adminGroup.PATCH("/users/:id/role", adminHandler.UpdateUserRole)
		adminGroup.POST("/subscriptions/coupon", adminHandler.CreateCoupon)
		adminGroup.DELETE("/subscriptions/coupon/:id", adminHandler.DeleteCoupon)
		adminGroup.PATCH("/settings", adminHandler.UpdateSettings)
	}
}

