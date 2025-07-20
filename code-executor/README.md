# Code Executor Service

Микросервис для выполнения и валидации кода на различных языках программирования.

## 🚀 Возможности

- **Многоподдержка языков**: Go, JavaScript, Python, 1С
- **Безопасное выполнение**: Изолированные временные директории
- **Валидация синтаксиса**: Проверка корректности кода
- **Тестирование**: Выполнение кода с тестовыми данными
- **REST API**: Простой HTTP интерфейс
- **Мониторинг здоровья**: Проверка состояния сервиса

## 📋 Поддерживаемые языки

| Язык | Версия | Статус |
|------|--------|--------|
| Go | 1.21+ | ✅ |
| JavaScript | 18.x | ✅ |
| Python | 3.8+ | ✅ |
| 1С | 1.4 | ✅ |

## 🏗️ Архитектура

```
code-executor/
├── cmd/server/          # Точка входа
├── internal/
│   ├── app/            # Типы данных
│   ├── handlers/       # HTTP обработчики
│   └── service/        # Бизнес-логика
├── Dockerfile          # Контейнеризация
└── README.md          # Документация
```

## 🚀 Быстрый старт

### Локальная разработка

1. **Установите зависимости:**
   ```bash
   cd code-executor
   go mod download
   ```

2. **Установите языки программирования:**
   ```bash
   # Go
   go version
   
   # Node.js
   node --version
   
   # Python
   python3 --version
   
   # 1С (OneScript)
   oscript --version
   ```

3. **Запустите сервис:**
   ```bash
   go run cmd/server/main.go
   ```

### Docker

```bash
# Сборка образа
docker build -t code-executor .

# Запуск контейнера
docker run -p 8081:8081 code-executor
```

## 📡 API Endpoints

### Выполнение кода

**POST** `/api/v1/execute`

```json
{
  "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello, World!\")\n}",
  "language": "go",
  "test_cases": [
    {
      "id": 1,
      "name": "Test case 1",
      "input": "",
      "output": "Hello, World!"
    }
  ],
  "timeout": "10s"
}
```

**Ответ:**
```json
{
  "success": true,
  "total_tests": 1,
  "passed_tests": 1,
  "test_results": [
    {
      "test_case": {
        "id": 1,
        "name": "Test case 1",
        "input": "",
        "output": "Hello, World!"
      },
      "user_output": "Hello, World!",
      "expected": "Hello, World!",
      "passed": true
    }
  ],
  "execution_time": "150ms"
}
```

### Валидация кода

**POST** `/api/v1/validate`

```json
{
  "code": "package main\n\nfunc main() {\n    fmt.Println(\"Hello\")\n}",
  "language": "go"
}
```

**Ответ:**
```json
{
  "valid": false,
  "error": "syntax error: undefined: fmt"
}
```

### Проверка здоровья

**GET** `/api/v1/health`

**Ответ:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T12:00:00Z",
  "languages": [
    {
      "name": "go",
      "display_name": "Go",
      "version": "1.21",
      "available": true
    },
    {
      "name": "javascript",
      "display_name": "JavaScript",
      "version": "18.x",
      "available": true
    }
  ]
}
```

## 🔧 Конфигурация

### Переменные окружения

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервера | `8081` |
| `TIMEOUT` | Таймаут выполнения кода | `10s` |

### Ограничения ресурсов

- **Память**: 1GB максимум
- **CPU**: 1 ядро максимум
- **Время выполнения**: 10 секунд максимум
- **Размер кода**: 1MB максимум

## 🛡️ Безопасность

### Изоляция выполнения

- Каждый запрос выполняется в отдельной временной директории
- Автоматическая очистка временных файлов
- Ограничения на использование ресурсов
- Запрет сетевого доступа

### Рекомендации по безопасности

1. **Запуск в контейнере** с ограниченными правами
2. **Мониторинг ресурсов** для предотвращения DoS
3. **Логирование** всех операций выполнения
4. **Регулярные обновления** зависимостей

## 📊 Мониторинг

### Метрики

- Количество запросов в секунду
- Время выполнения по языкам
- Количество ошибок
- Использование ресурсов

### Логирование

```bash
# Просмотр логов
docker logs code-executor

# Мониторинг в реальном времени
docker logs -f code-executor
```

## 🔍 Troubleshooting

### Частые проблемы

1. **Язык не найден**
   ```bash
   # Проверьте установку
   go version
   node --version
   python3 --version
   oscript --version
   ```

2. **Таймауты выполнения**
   - Увеличьте лимиты в конфигурации
   - Проверьте производительность системы
   - Особенно для 1С (интерпретируемый язык)

3. **Ошибки компиляции**
   - Проверьте синтаксис кода
   - Убедитесь в корректности импортов
   - Проверьте версии языков

### Отладка

```bash
# Запуск с подробными логами
DEBUG=true go run cmd/server/main.go

# Проверка здоровья сервиса
curl http://localhost:8081/api/v1/health
```

## 🚀 Развертывание

### Docker Compose

```yaml
version: '3.8'
services:
  code-executor:
    build: ./code-executor
    ports:
      - "8081:8081"
    environment:
      - PORT=8081
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-executor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: code-executor
  template:
    metadata:
      labels:
        app: code-executor
    spec:
      containers:
      - name: code-executor
        image: code-executor:latest
        ports:
        - containerPort: 8081
        resources:
          limits:
            memory: "1Gi"
            cpu: "1"
          requests:
            memory: "512Mi"
            cpu: "500m"
```

## 🤝 Интеграция

### Основной сервер

```go
// Создание клиента
client := NewCodeExecutorClient("http://localhost:8081")

// Выполнение кода
result, err := client.ExecuteCode(code, language, testCases)
if err != nil {
    // Обработка ошибки
}

// Валидация кода
err = client.ValidateCode(code, language)
if err != nil {
    // Обработка ошибки
}
```

## 📝 Лицензия

MIT License 