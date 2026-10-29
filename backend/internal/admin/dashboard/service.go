package dashboard

import (
	"github.com/Muhfaizr21/SyncCart/backend/models"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) Build5W1HSummary(
	stores []models.Store,
	users []models.User,
	products []models.Product,
	orders []models.Order,
	invoices []models.SubscriptionInvoice,
) map[string]any {
	var activeSellers, suspendedSellers int
	for _, st := range stores {
		if st.Status == "suspended" {
			suspendedSellers++
		} else {
			activeSellers++
		}
	}

	var totalGMV int64
	var paidOrders, shippedOrders, pendingOrders, cancelledOrders, totalItems int
	for _, o := range orders {
		totalItems += o.Quantity
		switch o.Status {
		case "Cancelled":
			cancelledOrders++
		case "Pending", "Perlu Resi":
			pendingOrders++
			totalGMV += o.Amount
		case "Shipped":
			shippedOrders++
			paidOrders++
			totalGMV += o.Amount
		default:
			paidOrders++
			totalGMV += o.Amount
		}
	}

	var saasRevenue int64
	for _, inv := range invoices {
		if inv.Status == "Paid" {
			saasRevenue += inv.TotalAmount
		}
	}

	var conflictProducts int
	for _, p := range products {
		if p.SyncStatus == "conflict" || p.Stock <= 10 {
			conflictProducts++
		}
	}

	totalOrd := len(orders)
	var avgOrderVal int64
	if totalOrd > 0 {
		avgOrderVal = totalGMV / int64(totalOrd)
	}
	avgItems := 1.0
	if totalOrd > 0 {
		avgItems = float64(totalItems) / float64(totalOrd)
	}

	return map[string]any{
		"total_sellers":              len(stores),
		"active_sellers":             activeSellers,
		"suspended_sellers":          suspendedSellers,
		"total_users":                len(users),
		"total_products":             len(products),
		"conflict_products":          conflictProducts,
		"total_orders":               totalOrd,
		"paid_orders":                paidOrders,
		"shipped_orders":             shippedOrders,
		"pending_orders":             pendingOrders,
		"cancelled_orders":           cancelledOrders,
		"total_gmv":                  totalGMV,
		"total_subscription_revenue": saasRevenue,
		"avg_order_value":            avgOrderVal,
		"avg_items_per_order":        avgItems,
	}
}

