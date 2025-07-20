# Скрипт для запуска тестов микросервиса code-executor
param(
    [string]$TestType = "all",
    [switch]$Build,
    [switch]$Docker,
    [switch]$Verbose
)

Write-Host "🚀 Запуск тестов микросервиса code-executor" -ForegroundColor Green
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
    $maxAttempts = 30
    $attempt = 0
    
    Write-Log "Проверка доступности сервиса..." "INFO"
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8081/api/v1/health" -TimeoutSec 5 -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Log "✅ Сервис доступен" "SUCCESS"
                return $true
            }
        }
        catch {
            # Игнорируем ошибки
        }
        
        $attempt++
        Write-Log "Попытка $attempt/$maxAttempts - ожидание запуска сервиса..." "WARN"
        Start-Sleep -Seconds 1
    }
    
    Write-Log "❌ Сервис недоступен после $maxAttempts попыток" "ERROR"
    return $false
}

# Функция для сборки проекта
function Build-Project {
    Write-Log "Сборка проекта..." "INFO"
    
    try {
        go mod tidy
        if ($LASTEXITCODE -ne 0) {
            Write-Log "❌ Ошибка при выполнении go mod tidy" "ERROR"
            return $false
        }
        
        go build -o code-executor.exe ./cmd/server
        if ($LASTEXITCODE -ne 0) {
            Write-Log "❌ Ошибка при сборке проекта" "ERROR"
            return $false
        }
        
        Write-Log "✅ Проект успешно собран" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "❌ Ошибка при сборке: $_" "ERROR"
        return $false
    }
}

# Функция для запуска сервиса в Docker
function Start-DockerService {
    Write-Log "Запуск сервиса в Docker..." "INFO"
    
    try {
        docker-compose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-Log "❌ Ошибка при запуске Docker контейнера" "ERROR"
            return $false
        }
        
        Write-Log "✅ Docker контейнер запущен" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "❌ Ошибка при запуске Docker: $_" "ERROR"
        return $false
    }
}

# Функция для остановки Docker сервиса
function Stop-DockerService {
    Write-Log "Остановка Docker сервиса..." "INFO"
    
    try {
        docker-compose down
        Write-Log "✅ Docker сервис остановлен" "SUCCESS"
    }
    catch {
        Write-Log "❌ Ошибка при остановке Docker: $_" "ERROR"
    }
}

# Функция для запуска тестов
function Run-Tests {
    param([string]$TestPattern = ".*")
    
    Write-Log "Запуск тестов с паттерном: $TestPattern" "INFO"
    
    $testArgs = @()
    
    if ($Verbose) {
        $testArgs += "-v"
    }
    
    $testArgs += "-run", $TestPattern
    
    try {
        $testOutput = & go test @testArgs 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Log "✅ Все тесты прошли успешно" "SUCCESS"
        } else {
            Write-Log "❌ Некоторые тесты не прошли" "ERROR"
        }
        
        if ($Verbose) {
            Write-Host $testOutput
        }
        
        return $exitCode -eq 0
    }
    catch {
        Write-Log "❌ Ошибка при запуске тестов: $_" "ERROR"
        return $false
    }
}

# Функция для запуска бенчмарков
function Run-Benchmarks {
    Write-Log "Запуск бенчмарков..." "INFO"
    
    try {
        $benchOutput = & go test -bench=. -benchmem 2>&1
        $exitCode = $LASTEXITCODE
        
        Write-Host $benchOutput
        
        if ($exitCode -eq 0) {
            Write-Log "✅ Бенчмарки выполнены успешно" "SUCCESS"
        } else {
            Write-Log "❌ Ошибка при выполнении бенчмарков" "ERROR"
        }
        
        return $exitCode -eq 0
    }
    catch {
        Write-Log "❌ Ошибка при запуске бенчмарков: $_" "ERROR"
        return $false
    }
}

# Основная логика
try {
    # Сборка проекта если требуется
    if ($Build) {
        if (-not (Build-Project)) {
            exit 1
        }
    }
    
    # Запуск Docker если требуется
    if ($Docker) {
        if (-not (Start-DockerService)) {
            exit 1
        }
        
        # Ждем запуска сервиса
        if (-not (Test-ServiceHealth)) {
            Stop-DockerService
            exit 1
        }
    }
    
    # Запуск тестов в зависимости от типа
    $testSuccess = $true
    
    switch ($TestType.ToLower()) {
        "integration" {
            Write-Log "Запуск интеграционных тестов..." "INFO"
            $testSuccess = Run-Tests "TestCodeExecutorSuite"
        }
        "performance" {
            Write-Log "Запуск тестов производительности..." "INFO"
            $testSuccess = Run-Tests "Test.*Performance|Test.*Load|Test.*Stress|Test.*Concurrent|Test.*Memory|Test.*Large"
        }
        "benchmark" {
            Write-Log "Запуск бенчмарков..." "INFO"
            $testSuccess = Run-Benchmarks
        }
        "all" {
            Write-Log "Запуск всех тестов..." "INFO"
            $testSuccess = Run-Tests ".*"
        }
        default {
            Write-Log "Запуск тестов с паттерном: $TestType" "INFO"
            $testSuccess = Run-Tests $TestType
        }
    }
    
    # Остановка Docker если был запущен
    if ($Docker) {
        Stop-DockerService
    }
    
    if ($testSuccess) {
        Write-Log "🎉 Все тесты выполнены успешно!" "SUCCESS"
        exit 0
    } else {
        Write-Log "💥 Некоторые тесты не прошли" "ERROR"
        exit 1
    }
}
catch {
    Write-Log "❌ Критическая ошибка: $_" "ERROR"
    if ($Docker) {
        Stop-DockerService
    }
    exit 1
} 