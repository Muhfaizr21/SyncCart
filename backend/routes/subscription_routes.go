package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/subscription"
	"github.com/gin-gonic/gin"
)

func RegisterSubscriptionRoutes(rg *gin.RouterGroup, subscriptionHandler *subscription.Handler) {
	rg.GET("/subscription/invoices", subscriptionHandler.GetSubscriptionInvoices)
	rg.POST("/subscription/checkout", subscriptionHandler.CheckoutSubscription)
}

