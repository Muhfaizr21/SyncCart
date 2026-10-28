package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/order"
	"github.com/gin-gonic/gin"
)

func RegisterOrderRoutes(rg *gin.RouterGroup, orderHandler *order.Handler) {
	rg.POST("/orders", orderHandler.CreateManualOrder)
	rg.POST("/orders/:id/ship", orderHandler.UpdateOrderShipping)
	rg.POST("/orders/bulk-action", orderHandler.BulkOrderAction)
	rg.DELETE("/orders/:id", orderHandler.DeleteOrder)
}

