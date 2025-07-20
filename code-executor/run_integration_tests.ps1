# PowerShell скрипт для запуска интеграционных тестов
Write-Host "🧪 Запуск интеграционных тестов для code-executor" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Проверяем, что Docker запущен
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker не запущен. Пожалуйста, запустите Docker и попробуйте снова." -ForegroundColor Red
    exit 1
}

# Останавливаем существующие контейнеры
Write-Host "🛑 Остановка существующих контейнеров..." -ForegroundColor Yellow
docker-compose down

# Собираем и запускаем микросервис
Write-Host "🔨 Сборка и запуск code-executor..." -ForegroundColor Yellow
docker-compose up -d code-executor

# Ждем, пока сервис запустится
Write-Host "⏳ Ожидание запуска сервиса..." -ForegroundColor Yellow
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/api/v1/health" -UseBasicParsing -TimeoutSec 1
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Сервис готов к тестированию" -ForegroundColor Green
            break
        }
    } catch {
        # Игнорируем ошибки подключения
    }
    Start-Sleep -Seconds 1
}

# Запускаем интеграционные тесты
Write-Host "🧪 Запуск интеграционных тестов..." -ForegroundColor Yellow
Set-Location code-executor
go test -v -run "TestHealth|TestGoExecution|TestPythonExecution|TestJavaScriptExecution" ./integration_test.go

# Проверяем результат
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Все тесты прошли успешно!" -ForegroundColor Green
} else {
    Write-Host "❌ Некоторые тесты не прошли" -ForegroundColor Red
}

# Останавливаем контейнеры
Write-Host "🛑 Остановка контейнеров..." -ForegroundColor Yellow
Set-Location ..
docker-compose down

Write-Host "🎉 Тестирование завершено!" -ForegroundColor Green 