#!/bin/bash

echo "🧪 Запуск интеграционных тестов для code-executor"
echo "================================================"

# Проверяем, что Docker запущен
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker не запущен. Пожалуйста, запустите Docker и попробуйте снова."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Собираем и запускаем микросервис
echo "🔨 Сборка и запуск code-executor..."
docker-compose up -d code-executor

# Ждем, пока сервис запустится
echo "⏳ Ожидание запуска сервиса..."
for i in {1..30}; do
    if curl -s http://localhost:8081/api/v1/health > /dev/null; then
        echo "✅ Сервис готов к тестированию"
        break
    fi
    sleep 1
done

# Запускаем интеграционные тесты
echo "🧪 Запуск интеграционных тестов..."
go test -v -run "TestHealth|TestGoExecution|TestPythonExecution|TestJavaScriptExecution" ./integration_test.go

# Проверяем результат
if [ $? -eq 0 ]; then
    echo "✅ Все тесты прошли успешно!"
else
    echo "❌ Некоторые тесты не прошли"
fi

# Останавливаем контейнеры
echo "🛑 Остановка контейнеров..."
docker-compose down

echo "🎉 Тестирование завершено!" 