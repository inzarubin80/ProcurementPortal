package handlers

import (
	"net/http"
	"time"

	"code-executor/internal/app"
	"code-executor/internal/service"

	"github.com/gin-gonic/gin"
)

// CodeExecutorHandler обработчик для выполнения кода
type CodeExecutorHandler struct {
	service *service.CodeExecutorService
}

// NewCodeExecutorHandler создает новый обработчик
func NewCodeExecutorHandler(service *service.CodeExecutorService) *CodeExecutorHandler {
	return &CodeExecutorHandler{
		service: service,
	}
}

// ExecuteCode выполняет код и возвращает результат
func (h *CodeExecutorHandler) ExecuteCode(c *gin.Context) {
	var req app.ExecuteCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format: " + err.Error(),
		})
		return
	}

	// Устанавливаем таймаут по умолчанию если не указан
	if req.Timeout == 0 {
		req.Timeout = 10 * time.Second
	}

	result, err := h.service.ExecuteCode(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Execution failed: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

// ValidateCode проверяет синтаксис кода
func (h *CodeExecutorHandler) ValidateCode(c *gin.Context) {
	var req app.ValidateCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format: " + err.Error(),
		})
		return
	}

	err := h.service.ValidateCode(req.Code, req.Language)

	response := app.ValidateCodeResponse{
		Valid: err == nil,
	}

	if err != nil {
		response.Error = err.Error()
	}

	c.JSON(http.StatusOK, response)
}

// Health проверяет состояние сервиса
func (h *CodeExecutorHandler) Health(c *gin.Context) {
	languages := h.service.GetSupportedLanguages()

	response := app.HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now(),
		Languages: languages,
	}

	c.JSON(http.StatusOK, response)
}

// SetupRoutes настраивает маршруты
func (h *CodeExecutorHandler) SetupRoutes(router *gin.Engine) {
	api := router.Group("/api/v1")
	{
		api.POST("/execute", h.ExecuteCode)
		api.POST("/validate", h.ValidateCode)
		api.GET("/health", h.Health)
	}
}
