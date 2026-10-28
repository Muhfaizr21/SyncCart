package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/config"
	"github.com/Muhfaizr21/SyncCart/backend/internal/auth"
	"github.com/gin-gonic/gin"
)

func RegisterAuthRoutes(router *gin.Engine, authHandler *auth.Handler, authService *auth.Service) {
	authGroup := router.Group("/api/auth")
	{
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/logout", authHandler.Logout)
		authGroup.GET("/me", auth.JWTMiddleware(authService), authHandler.Me)
	}

	adminGroup := router.Group("/api/admin")
	adminGroup.Use(auth.JWTMiddleware(authService), auth.RequireRole(config.RoleSuperAdmin))
	{
		adminGroup.GET("/users", authHandler.ListUsersAdmin)
	}
}

