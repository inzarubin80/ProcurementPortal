package docker

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"testing"
	"time"

	"code-executor/internal/app"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	baseURL = "http://localhost:8081"
)

// TestConcurrentExecution тестирует параллельное выполнение кода
func TestConcurrentExecution(t *testing.T) {
	client := &http.Client{Timeout: 30 * time.Second}

	// Простой код для тестирования
	code := `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Test", Input: "", Output: "Hello, World!"},
	}

	// Количество параллельных запросов
	numRequests := 10
	var wg sync.WaitGroup
	results := make(chan bool, numRequests)

	startTime := time.Now()

	// Запускаем параллельные запросы
	for i := 0; i < numRequests; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()

			req := app.ExecuteCodeRequest{
				Code:      code,
				Language:  "go",
				TestCases: testCases,
				Timeout:   5 * time.Second,
			}

			jsonData, err := json.Marshal(req)
			require.NoError(t, err, "Ошибка маршалинга JSON")

			resp, err := client.Post(baseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
			if err != nil {
				results <- false
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				results <- false
				return
			}

			var result app.CodeExecutionResult
			err = json.NewDecoder(resp.Body).Decode(&result)
			if err != nil {
				results <- false
				return
			}

			results <- result.Success
		}(i)
	}

	wg.Wait()
	close(results)

	// Подсчитываем результаты
	successCount := 0
	for success := range results {
		if success {
			successCount++
		}
	}

	duration := time.Since(startTime)

	assert.Equal(t, numRequests, successCount, "Все запросы должны выполниться успешно")
	assert.Less(t, duration, 10*time.Second, "Общее время выполнения не должно превышать 10 секунд")

	t.Logf("✅ Параллельное выполнение: %d/%d успешных запросов за %v", successCount, numRequests, duration)
}

// TestMemoryUsage тестирует использование памяти
func TestMemoryUsage(t *testing.T) {
	client := &http.Client{Timeout: 30 * time.Second}

	// Код с большим выводом для тестирования памяти
	code := `package main

import "fmt"

func main() {
    for i := 0; i < 1000; i++ {
        fmt.Printf("Line %d: Hello, World!\n", i)
    }
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Memory test", Input: "", Output: "Line 999: Hello, World!"},
	}

	req := app.ExecuteCodeRequest{
		Code:      code,
		Language:  "go",
		TestCases: testCases,
		Timeout:   10 * time.Second,
	}

	jsonData, err := json.Marshal(req)
	require.NoError(t, err, "Ошибка маршалинга JSON")

	startTime := time.Now()
	resp, err := client.Post(baseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
	require.NoError(t, err, "Ошибка отправки запроса")
	defer resp.Body.Close()

	duration := time.Since(startTime)

	assert.Equal(t, http.StatusOK, resp.StatusCode, "Запрос должен выполниться успешно")
	assert.Less(t, duration, 5*time.Second, "Выполнение не должно занимать более 5 секунд")

	t.Logf("✅ Тест использования памяти завершен за %v", duration)
}

// TestLargeCodeExecution тестирует выполнение большого кода
func TestLargeCodeExecution(t *testing.T) {
	client := &http.Client{Timeout: 30 * time.Second}

	// Генерируем большой код
	largeCode := `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    // Много комментариев для увеличения размера кода
    // Это тест для проверки обработки больших файлов
    // Комментарий 1
    // Комментарий 2
    // Комментарий 3
    // ... (много комментариев)
    // Комментарий 100
}`

	// Добавляем много комментариев
	for i := 4; i <= 100; i++ {
		largeCode += fmt.Sprintf("    // Комментарий %d\n", i)
	}
	largeCode += "}"

	testCases := []app.TestCase{
		{ID: 1, Name: "Large code test", Input: "", Output: "Hello, World!"},
	}

	req := app.ExecuteCodeRequest{
		Code:      largeCode,
		Language:  "go",
		TestCases: testCases,
		Timeout:   10 * time.Second,
	}

	jsonData, err := json.Marshal(req)
	require.NoError(t, err, "Ошибка маршалинга JSON")

	startTime := time.Now()
	resp, err := client.Post(baseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
	require.NoError(t, err, "Ошибка отправки запроса")
	defer resp.Body.Close()

	duration := time.Since(startTime)

	assert.Equal(t, http.StatusOK, resp.StatusCode, "Запрос должен выполниться успешно")
	assert.Less(t, duration, 5*time.Second, "Выполнение не должно занимать более 5 секунд")

	t.Logf("✅ Тест большого кода завершен за %v", duration)
}

// TestStressLoad тестирует нагрузку на сервис
func TestStressLoad(t *testing.T) {
	client := &http.Client{Timeout: 60 * time.Second}

	// Простой код для стресс-тестирования
	code := `package main

import "fmt"

func main() {
    fmt.Println("Stress test")
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Stress test", Input: "", Output: "Stress test"},
	}

	// Количество запросов для стресс-теста
	numRequests := 50
	var wg sync.WaitGroup
	results := make(chan time.Duration, numRequests)

	startTime := time.Now()

	// Запускаем стресс-тест
	for i := 0; i < numRequests; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()

			req := app.ExecuteCodeRequest{
				Code:      code,
				Language:  "go",
				TestCases: testCases,
				Timeout:   5 * time.Second,
			}

			jsonData, err := json.Marshal(req)
			if err != nil {
				results <- 0
				return
			}

			requestStart := time.Now()
			resp, err := client.Post(baseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
			if err != nil {
				results <- 0
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				results <- 0
				return
			}

			var result app.CodeExecutionResult
			err = json.NewDecoder(resp.Body).Decode(&result)
			if err != nil {
				results <- 0
				return
			}

			results <- time.Since(requestStart)
		}(i)
	}

	wg.Wait()
	close(results)

	// Анализируем результаты
	var durations []time.Duration
	for duration := range results {
		if duration > 0 {
			durations = append(durations, duration)
		}
	}

	totalDuration := time.Since(startTime)
	successRate := float64(len(durations)) / float64(numRequests) * 100

	assert.GreaterOrEqual(t, successRate, 90.0, "Успешность должна быть не менее 90%")
	assert.Less(t, totalDuration, 30*time.Second, "Общее время не должно превышать 30 секунд")

	// Вычисляем среднее время ответа
	var totalTime time.Duration
	for _, d := range durations {
		totalTime += d
	}
	avgResponseTime := totalTime / time.Duration(len(durations))

	assert.Less(t, avgResponseTime, 2*time.Second, "Среднее время ответа не должно превышать 2 секунды")

	t.Logf("✅ Стресс-тест завершен: %d/%d успешных запросов (%.1f%%), среднее время ответа: %v",
		len(durations), numRequests, successRate, avgResponseTime)
}

// TestDifferentLanguagesPerformance тестирует производительность разных языков
func TestDifferentLanguagesPerformance(t *testing.T) {
	client := &http.Client{Timeout: 30 * time.Second}

	languages := []struct {
		name string
		code string
	}{
		{
			name: "go",
			code: `package main
import "fmt"
func main() {
    fmt.Println("Hello, World!")
}`,
		},
		{
			name: "python",
			code: `print("Hello, World!")`,
		},
		{
			name: "javascript",
			code: `console.log("Hello, World!");`,
		},
		{
			name: "java",
			code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
		},
		{
			name: "1c",
			code: `Сообщить("Hello, World!");`,
		},
	}

	testCases := []app.TestCase{
		{ID: 1, Name: "Performance test", Input: "", Output: "Hello, World!"},
	}

	for _, lang := range languages {
		t.Run(lang.name, func(t *testing.T) {
			req := app.ExecuteCodeRequest{
				Code:      lang.code,
				Language:  lang.name,
				TestCases: testCases,
				Timeout:   10 * time.Second,
			}

			jsonData, err := json.Marshal(req)
			require.NoError(t, err, "Ошибка маршалинга JSON")

			startTime := time.Now()
			resp, err := client.Post(baseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
			require.NoError(t, err, "Ошибка отправки запроса")
			defer resp.Body.Close()

			duration := time.Since(startTime)

			assert.Equal(t, http.StatusOK, resp.StatusCode, "Запрос должен выполниться успешно")
			if lang.name == "go" {
				assert.Less(t, duration, 7*time.Second, "Выполнение Go не должно занимать более 7 секунд")
			} else {
				assert.Less(t, duration, 5*time.Second, "Выполнение не должно занимать более 5 секунд")
			}

			t.Logf("✅ %s: %v", lang.name, duration)
		})
	}
}

// BenchmarkCodeExecution бенчмарк для выполнения кода
func BenchmarkCodeExecution(b *testing.B) {
	client := &http.Client{Timeout: 30 * time.Second}

	code := `package main
import "fmt"
func main() {
    fmt.Println("Hello, World!")
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Benchmark test", Input: "", Output: "Hello, World!"},
	}

	req := app.ExecuteCodeRequest{
		Code:      code,
		Language:  "go",
		TestCases: testCases,
		Timeout:   5 * time.Second,
	}

	jsonData, err := json.Marshal(req)
	require.NoError(b, err, "Ошибка маршалинга JSON")

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		resp, err := client.Post(baseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
		if err != nil {
			b.Fatal(err)
		}
		resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			b.Fatalf("Неожиданный статус: %d", resp.StatusCode)
		}
	}
}
