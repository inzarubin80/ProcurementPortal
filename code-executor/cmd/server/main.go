package main

import (
	"log"
	"net/http"
	"time"

	"code-executor/internal/handlers"
	"code-executor/internal/service"

	"github.com/gin-gonic/gin"
)

func main() {
	// Создаем сервис выполнения кода
	codeExecutorService := service.NewCodeExecutorService(30 * time.Second)

	// Создаем обработчики
	codeExecutorHandler := handlers.NewCodeExecutorHandler(codeExecutorService)

	// Настраиваем Gin
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	// Настраиваем CORS
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// API маршруты
	api := router.Group("/api/v1")
	{
		api.POST("/execute", codeExecutorHandler.ExecuteCode)
		api.POST("/validate", codeExecutorHandler.ValidateCode)
		api.GET("/health", codeExecutorHandler.Health)
	}

	// Базовый маршрут
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Code Executor Service",
			"version": "1.0.0",
		})
	})

	// Запускаем сервер
	log.Println("🚀 Запуск микросервиса code-executor на порту 8080...")
	log.Println("📊 API доступен по адресу: http://localhost:8080/api/v1")
	log.Println("🏥 Health check: http://localhost:8080/api/v1/health")

	if err := router.Run(":8080"); err != nil {
		log.Fatal("❌ Ошибка запуска сервера:", err)
	}
}
