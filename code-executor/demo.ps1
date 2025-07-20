# Демонстрационный скрипт для микросервиса code-executor
param(
    [switch]$StartService,
    [switch]$RunTests,
    [switch]$ShowAPI
)

Write-Host "🚀 Демонстрация микросервиса code-executor" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Функция для логирования
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

# Функция для проверки доступности сервиса
function Test-ServiceHealth {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $health = $response.Content | ConvertFrom-Json
            Write-Log "✅ Сервис доступен" "SUCCESS"
            Write-Log "Статус: $($health.status)" "INFO"
            Write-Log "Поддерживаемых языков: $($health.languages.Count)" "INFO"
            return $true
        }
    }
    catch {
        Write-Log "❌ Сервис недоступен" "ERROR"
        return $false
    }
}

# Функция для запуска сервиса
function Start-CodeExecutorService {
    Write-Log "Запуск сервиса code-executor..." "INFO"
    
    if (Test-Path "./code-executor.exe") {
        Start-Process -FilePath "./code-executor.exe" -WindowStyle Minimized
        Write-Log "✅ Сервис запущен в фоновом режиме" "SUCCESS"
        
        # Ждем запуска сервиса
        for ($i = 0; $i -lt 10; $i++) {
            Start-Sleep -Seconds 1
            if (Test-ServiceHealth) {
                break
            }
        }
    } else {
        Write-Log "❌ Исполняемый файл не найден. Сначала соберите проект: go build -o code-executor.exe ./cmd/server" "ERROR"
        return $false
    }
}

# Функция для демонстрации API
function Show-APIExamples {
    Write-Log "📚 Демонстрация API endpoints" "INFO"
    Write-Host ""
    
    # Health Check
    Write-Log "1. Health Check:" "INFO"
    Write-Host "   GET http://localhost:8080/api/v1/health"
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -UseBasicParsing
        $health = $response.Content | ConvertFrom-Json
        Write-Host "   Ответ: $($health.status)" -ForegroundColor Green
    }
    catch {
        Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # Execute Java Code
    Write-Log "2. Выполнение Java кода:" "INFO"
    Write-Host "   POST http://localhost:8080/api/v1/execute"
    $javaCode = @{
        code = "public class Main {`n    public static void main(String[] args) {`n        System.out.println(`"Hello, World!`");`n    }`n}"
        language = "java"
        test_cases = @(
            @{id = 1; name = "Test"; input = ""; output = "Hello, World!"}
        )
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/execute" -Method POST -Body ($javaCode | ConvertTo-Json -Depth 10) -ContentType "application/json" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        Write-Host "   Результат: $($result.success) ($($result.passed_tests)/$($result.total_tests) тестов)" -ForegroundColor Green
    }
    catch {
        Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # Execute JavaScript Code
    Write-Log "3. Выполнение JavaScript кода:" "INFO"
    Write-Host "   POST http://localhost:8080/api/v1/execute"
    $jsCode = @{
        code = "console.log(`"Hello, World!`");"
        language = "javascript"
        test_cases = @(
            @{id = 1; name = "Test"; input = ""; output = "Hello, World!"}
        )
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/execute" -Method POST -Body ($jsCode | ConvertTo-Json -Depth 10) -ContentType "application/json" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        Write-Host "   Результат: $($result.success) ($($result.passed_tests)/$($result.total_tests) тестов)" -ForegroundColor Green
    }
    catch {
        Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
    
    # Validate Python Code
    Write-Log "4. Валидация Python кода:" "INFO"
    Write-Host "   POST http://localhost:8080/api/v1/validate"
    $pythonCode = @{
        code = "print(`"Hello, World!`")"
        language = "python"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/validate" -Method POST -Body ($pythonCode | ConvertTo-Json -Depth 10) -ContentType "application/json" -UseBasicParsing
        $result = $response.Content | ConvertFrom-Json
        Write-Host "   Результат: $($result.valid)" -ForegroundColor Green
    }
    catch {
        Write-Host "   Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Функция для запуска тестов
function Run-DemoTests {
    Write-Log "🧪 Запуск демонстрационных тестов" "INFO"
    
    if (-not (Test-ServiceHealth)) {
        Write-Log "❌ Сервис недоступен. Запустите сервис сначала." "ERROR"
        return
    }
    
    # Запускаем интеграционные тесты
    Write-Log "Запуск интеграционных тестов..." "INFO"
    $testOutput = & go test -v integration_test.go 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Log "✅ Все тесты прошли успешно" "SUCCESS"
    } else {
        Write-Log "⚠️ Некоторые тесты не прошли (это нормально для демонстрации)" "WARN"
    }
    
    # Показываем краткую статистику
    $passedTests = ($testOutput | Select-String "✅.*тест прошел").Count
    $failedTests = ($testOutput | Select-String "FAIL").Count
    
    Write-Log "Статистика тестов:" "INFO"
    Write-Host "   Успешных тестов: $passedTests" -ForegroundColor Green
    Write-Host "   Неудачных тестов: $failedTests" -ForegroundColor Yellow
}

# Основная логика
try {
    if ($StartService) {
        Start-CodeExecutorService
    }
    
    if ($ShowAPI) {
        if (Test-ServiceHealth) {
            Show-APIExamples
        } else {
            Write-Log "❌ Сервис недоступен. Запустите с параметром -StartService" "ERROR"
        }
    }
    
    if ($RunTests) {
        Run-DemoTests
    }
    
    # Если не указаны параметры, показываем справку
    if (-not $StartService -and -not $ShowAPI -and -not $RunTests) {
        Write-Log "Использование:" "INFO"
        Write-Host "   .\demo.ps1 -StartService    # Запустить сервис" -ForegroundColor Cyan
        Write-Host "   .\demo.ps1 -ShowAPI         # Показать примеры API" -ForegroundColor Cyan
        Write-Host "   .\demo.ps1 -RunTests        # Запустить тесты" -ForegroundColor Cyan
        Write-Host "   .\demo.ps1 -StartService -ShowAPI -RunTests  # Полная демонстрация" -ForegroundColor Cyan
        Write-Host ""
        Write-Log "Дополнительная информация:" "INFO"
        Write-Host "   - Документация: README.md" -ForegroundColor Yellow
        Write-Host "   - Отчет о тестировании: TEST_REPORT.md" -ForegroundColor Yellow
        Write-Host "   - Запуск тестов: .\run_tests.ps1" -ForegroundColor Yellow
    }
}
catch {
    Write-Log "❌ Критическая ошибка: $_" "ERROR"
    exit 1
} 