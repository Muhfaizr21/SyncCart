package auth

import (
	"net/http"
	"strings"

	"github.com/Muhfaizr21/SyncCart/backend/internal/common"
	"github.com/gin-gonic/gin"
)

func JWTMiddleware(service *Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			common.JSONError(c, http.StatusUnauthorized, "Sesi belum terautentikasi", "missing bearer token")
			c.Abort()
			return
		}

		rawToken := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		claims, err := service.ValidateJWT(rawToken)
		if err != nil {
			common.JSONError(c, http.StatusUnauthorized, "Token sesi tidak valid atau kedaluwarsa", err.Error())
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)
		c.Next()
	}
}

func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get("user_role")
		if !exists {
			common.JSONError(c, http.StatusForbidden, "Akses ditolak", "role not found in context")
			c.Abort()
			return
		}

		userRole, _ := roleVal.(string)
		for _, allowed := range allowedRoles {
			if userRole == allowed {
				c.Next()
				return
			}
		}

		common.JSONError(c, http.StatusForbidden, "Peran akun Anda tidak memiliki izin ke endpoint ini", "insufficient role permission")
		c.Abort()
	}
}

