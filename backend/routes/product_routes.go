package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/product"
	"github.com/gin-gonic/gin"
)

func RegisterProductRoutes(rg *gin.RouterGroup, productHandler *product.Handler) {
	rg.POST("/products", productHandler.CreateProduct)
	rg.PATCH("/products/:id", productHandler.UpdateProduct)
	rg.POST("/products/:id/duplicate", productHandler.DuplicateProduct)
	rg.POST("/products/bulk-action", productHandler.BulkProductAction)
	rg.PATCH("/products/:id/stock", productHandler.UpdateProductStock)
	rg.POST("/products/sync-stock", productHandler.SyncAllProductsStock)
	rg.DELETE("/products/:id", productHandler.DeleteProduct)
}

