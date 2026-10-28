package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/team"
	"github.com/gin-gonic/gin"
)

func RegisterTeamRoutes(rg *gin.RouterGroup, teamHandler *team.Handler) {
	rg.POST("/team/invite", teamHandler.InviteTeamMember)
	rg.PATCH("/team/:id/permissions", teamHandler.UpdateTeamPermissions)
	rg.POST("/team/:id/session-action", teamHandler.TeamSessionAction)
	rg.POST("/team/transfer-ownership", teamHandler.TransferStoreOwnership)
	rg.DELETE("/team/:id", teamHandler.DeleteTeamMember)
}

