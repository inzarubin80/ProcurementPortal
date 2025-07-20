// Package docs Code Executor API.
//
// Документация для Code Executor API
//
//	Schemes: http
//	Host: localhost:8080
//	BasePath: /api/v1
//	Version: 1.0.0
//
//	Consumes:
//	- application/json
//
//	Produces:
//	- application/json
//
//	Security:
//	- api_key
//
// swagger:meta
package docs

import "github.com/swaggo/swag"

// swagger:operation POST /execute execute executeCode
//
// Выполнение кода
//
// Выполняет код на указанном языке программирования и возвращает результат выполнения тестов
//
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: request
//   in: body
//   required: true
//   schema:
//     "$ref": "#/definitions/ExecuteCodeRequest"
// responses:
//   "200":
//     description: Успешное выполнение
//     schema:
//       "$ref": "#/definitions/CodeExecutionResult"
//   "400":
//     description: Неверный формат запроса
//     schema:
//       type: object
//       properties:
//         error:
//           type: string
//   "500":
//     description: Ошибка выполнения
//     schema:
//       type: object
//       properties:
//         error:
//           type: string

// swagger:operation POST /validate validate validateCode
//
// Валидация синтаксиса кода
//
// Проверяет синтаксис кода на указанном языке программирования
//
// ---
// consumes:
// - application/json
// produces:
// - application/json
// parameters:
// - name: request
//   in: body
//   required: true
//   schema:
//     "$ref": "#/definitions/ValidateCodeRequest"
// responses:
//   "200":
//     description: Результат валидации
//     schema:
//       "$ref": "#/definitions/ValidateCodeResponse"
//   "400":
//     description: Неверный формат запроса
//     schema:
//       type: object
//       properties:
//         error:
//           type: string

// swagger:operation GET /health health getHealth
//
// Проверка состояния сервиса
//
// Возвращает информацию о состоянии сервиса и поддерживаемых языках программирования
//
// ---
// produces:
// - application/json
// responses:
//   "200":
//     description: Состояние сервиса
//     schema:
//       "$ref": "#/definitions/HealthResponse"

// swagger:model ExecuteCodeRequest
type ExecuteCodeRequest struct {
	// Код для выполнения
	// required: true
	// example: "print('Hello, World!')"
	Code string `json:"code" binding:"required"`

	// Язык программирования
	// required: true
	// enum: python,javascript,java,cpp,csharp,go,rust,kotlin,swift,typescript,1c
	// example: "python"
	Language string `json:"language" binding:"required"`

	// Тестовые случаи
	// required: true
	TestCases []TestCase `json:"test_cases" binding:"required"`

	// Таймаут выполнения в секундах
	// example: 10
	Timeout int `json:"timeout,omitempty"`
}

// swagger:model ValidateCodeRequest
type ValidateCodeRequest struct {
	// Код для валидации
	// required: true
	// example: "print('Hello, World!')"
	Code string `json:"code" binding:"required"`

	// Язык программирования
	// required: true
	// enum: python,javascript,java,cpp,csharp,go,rust,kotlin,swift,typescript,1c
	// example: "python"
	Language string `json:"language" binding:"required"`
}

// swagger:model TestCase
type TestCase struct {
	// ID тестового случая
	// example: 1
	ID int `json:"id"`

	// Название тестового случая
	// example: "Test 1"
	Name string `json:"name"`

	// Входные данные
	// example: "World"
	Input string `json:"input"`

	// Ожидаемый вывод
	// example: "Hello, World!"
	Output string `json:"output"`
}

// swagger:model TestResult
type TestResult struct {
	// Тестовый случай
	TestCase TestCase `json:"test_case"`

	// Вывод пользовательского кода
	// example: "Hello, World!"
	UserOutput string `json:"user_output"`

	// Ожидаемый вывод
	// example: "Hello, World!"
	Expected string `json:"expected"`

	// Прошел ли тест
	// example: true
	Passed bool `json:"passed"`

	// Ошибка выполнения (если есть)
	Error string `json:"error,omitempty"`
}

// swagger:model CodeExecutionResult
type CodeExecutionResult struct {
	// Успешность выполнения
	// example: true
	Success bool `json:"success"`

	// Общее количество тестов
	// example: 2
	TotalTests int `json:"total_tests"`

	// Количество пройденных тестов
	// example: 2
	PassedTests int `json:"passed_tests"`

	// Результаты тестов
	TestResults []TestResult `json:"test_results"`

	// Время выполнения в миллисекундах
	// example: 150
	ExecutionTime int `json:"execution_time,omitempty"`

	// Ошибка выполнения (если есть)
	Error string `json:"error,omitempty"`
}

// swagger:model ValidateCodeResponse
type ValidateCodeResponse struct {
	// Валидность кода
	// example: true
	Valid bool `json:"valid"`

	// Ошибка валидации (если есть)
	Error string `json:"error,omitempty"`
}

// swagger:model LanguageInfo
type LanguageInfo struct {
	// Код языка
	// example: "python"
	Name string `json:"name"`

	// Отображаемое название
	// example: "Python"
	DisplayName string `json:"display_name"`

	// Версия языка
	// example: "3.9.0"
	Version string `json:"version"`

	// Доступность языка
	// example: true
	Available bool `json:"available"`
}

// swagger:model HealthResponse
type HealthResponse struct {
	// Статус сервиса
	// example: "healthy"
	Status string `json:"status"`

	// Временная метка
	// example: "2023-12-01T12:00:00Z"
	Timestamp string `json:"timestamp"`

	// Поддерживаемые языки
	Languages []LanguageInfo `json:"languages"`
}

// SwaggerInfo содержит информацию о Swagger
var SwaggerInfo = &swag.Spec{
	Version:          "1.0.0",
	Host:             "localhost:8080",
	BasePath:         "/api/v1",
	Schemes:          []string{"http"},
	Title:            "Code Executor API",
	Description:      "API для выполнения и валидации кода на различных языках программирования",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
}

const docTemplate = `{
  "swagger": "2.0",
  "info": {
    "title": "Code Executor API",
    "description": "API для выполнения и валидации кода на различных языках программирования",
    "version": "1.0.0",
    "contact": {
      "name": "API Support",
      "email": "support@code-executor.com"
    }
  },
  "host": "localhost:8080",
  "basePath": "/api/v1",
  "schemes": ["http"],
  "consumes": ["application/json"],
  "produces": ["application/json"],
  "paths": {
    "/execute": {
      "post": {
        "tags": ["Code Execution"],
        "summary": "Выполнение кода",
        "description": "Выполняет код на указанном языке программирования и возвращает результат выполнения тестов",
        "parameters": [
          {
            "name": "request",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/ExecuteCodeRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Успешное выполнение",
            "schema": {
              "$ref": "#/definitions/CodeExecutionResult"
            }
          },
          "400": {
            "description": "Неверный формат запроса",
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string"
                }
              }
            }
          },
          "500": {
            "description": "Ошибка выполнения",
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/validate": {
      "post": {
        "tags": ["Code Validation"],
        "summary": "Валидация синтаксиса кода",
        "description": "Проверяет синтаксис кода на указанном языке программирования",
        "parameters": [
          {
            "name": "request",
            "in": "body",
            "required": true,
            "schema": {
              "$ref": "#/definitions/ValidateCodeRequest"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Результат валидации",
            "schema": {
              "$ref": "#/definitions/ValidateCodeResponse"
            }
          },
          "400": {
            "description": "Неверный формат запроса",
            "schema": {
              "type": "object",
              "properties": {
                "error": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    },
    "/health": {
      "get": {
        "tags": ["Health"],
        "summary": "Проверка состояния сервиса",
        "description": "Возвращает информацию о состоянии сервиса и поддерживаемых языках программирования",
        "responses": {
          "200": {
            "description": "Состояние сервиса",
            "schema": {
              "$ref": "#/definitions/HealthResponse"
            }
          }
        }
      }
    }
  },
  "definitions": {
    "ExecuteCodeRequest": {
      "type": "object",
      "required": ["code", "language", "test_cases"],
      "properties": {
        "code": {
          "type": "string",
          "description": "Код для выполнения",
          "example": "print('Hello, World!')"
        },
        "language": {
          "type": "string",
          "description": "Язык программирования",
          "enum": ["python", "javascript", "java", "cpp", "csharp", "go", "rust", "kotlin", "swift", "typescript", "1c"],
          "example": "python"
        },
        "test_cases": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/TestCase"
          },
          "description": "Тестовые случаи"
        },
        "timeout": {
          "type": "integer",
          "description": "Таймаут выполнения в секундах",
          "example": 10
        }
      }
    },
    "ValidateCodeRequest": {
      "type": "object",
      "required": ["code", "language"],
      "properties": {
        "code": {
          "type": "string",
          "description": "Код для валидации",
          "example": "print('Hello, World!')"
        },
        "language": {
          "type": "string",
          "description": "Язык программирования",
          "enum": ["python", "javascript", "java", "cpp", "csharp", "go", "rust", "kotlin", "swift", "typescript", "1c"],
          "example": "python"
        }
      }
    },
    "TestCase": {
      "type": "object",
      "properties": {
        "id": {
          "type": "integer",
          "description": "ID тестового случая",
          "example": 1
        },
        "name": {
          "type": "string",
          "description": "Название тестового случая",
          "example": "Test 1"
        },
        "input": {
          "type": "string",
          "description": "Входные данные",
          "example": "World"
        },
        "output": {
          "type": "string",
          "description": "Ожидаемый вывод",
          "example": "Hello, World!"
        }
      }
    },
    "TestResult": {
      "type": "object",
      "properties": {
        "test_case": {
          "$ref": "#/definitions/TestCase"
        },
        "user_output": {
          "type": "string",
          "description": "Вывод пользовательского кода",
          "example": "Hello, World!"
        },
        "expected": {
          "type": "string",
          "description": "Ожидаемый вывод",
          "example": "Hello, World!"
        },
        "passed": {
          "type": "boolean",
          "description": "Прошел ли тест",
          "example": true
        },
        "error": {
          "type": "string",
          "description": "Ошибка выполнения (если есть)"
        }
      }
    },
    "CodeExecutionResult": {
      "type": "object",
      "properties": {
        "success": {
          "type": "boolean",
          "description": "Успешность выполнения",
          "example": true
        },
        "total_tests": {
          "type": "integer",
          "description": "Общее количество тестов",
          "example": 2
        },
        "passed_tests": {
          "type": "integer",
          "description": "Количество пройденных тестов",
          "example": 2
        },
        "test_results": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/TestResult"
          },
          "description": "Результаты тестов"
        },
        "execution_time": {
          "type": "integer",
          "description": "Время выполнения в миллисекундах",
          "example": 150
        },
        "error": {
          "type": "string",
          "description": "Ошибка выполнения (если есть)"
        }
      }
    },
    "ValidateCodeResponse": {
      "type": "object",
      "properties": {
        "valid": {
          "type": "boolean",
          "description": "Валидность кода",
          "example": true
        },
        "error": {
          "type": "string",
          "description": "Ошибка валидации (если есть)"
        }
      }
    },
    "LanguageInfo": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Код языка",
          "example": "python"
        },
        "display_name": {
          "type": "string",
          "description": "Отображаемое название",
          "example": "Python"
        },
        "version": {
          "type": "string",
          "description": "Версия языка",
          "example": "3.9.0"
        },
        "available": {
          "type": "boolean",
          "description": "Доступность языка",
          "example": true
        }
      }
    },
    "HealthResponse": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "description": "Статус сервиса",
          "example": "healthy"
        },
        "timestamp": {
          "type": "string",
          "description": "Временная метка",
          "example": "2023-12-01T12:00:00Z"
        },
        "languages": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/LanguageInfo"
          },
          "description": "Поддерживаемые языки"
        }
      }
    }
  },
  "tags": [
    {
      "name": "Code Execution",
      "description": "Операции выполнения кода"
    },
    {
      "name": "Code Validation",
      "description": "Операции валидации кода"
    },
    {
      "name": "Health",
      "description": "Операции проверки состояния сервиса"
    }
  ]
}`
