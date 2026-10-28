package routes

import (
	"github.com/Muhfaizr21/SyncCart/backend/internal/report"
	"github.com/gin-gonic/gin"
)

func RegisterReportRoutes(rg *gin.RouterGroup, reportHandler *report.Handler) {
	rg.GET("/reports/summary", reportHandler.GetReportSummary)
}

