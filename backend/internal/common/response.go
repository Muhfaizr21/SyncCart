package common

import "github.com/gin-gonic/gin"

type APIResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
	Error   string `json:"error,omitempty"`
}

func JSONSuccess(c *gin.Context, status int, message string, data any) {
	c.JSON(status, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func JSONError(c *gin.Context, status int, message string, errDetail string) {
	c.JSON(status, APIResponse{
		Success: false,
		Message: message,
		Error:   errDetail,
	})
}

