package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"code-executor/types"
)

func main() {
	fmt.Println("🧪 Тест микросервиса code-executor в Docker")
	fmt.Println("============================================")

	// Ждем, пока сервис запустится
	fmt.Println("⏳ Ожидание запуска сервиса...")
	for i := 0; i < 30; i++ {
		resp, err := http.Get("http://localhost:8081/api/v1/health")
		if err == nil && resp.StatusCode == http.StatusOK {
			fmt.Println("✅ Сервис готов к тестированию")
			break
		}
		time.Sleep(1 * time.Second)
	}

	// Тест 1: Проверка здоровья сервиса
	fmt.Println("\n1️⃣ Проверка здоровья сервиса...")
	if err := testHealth(); err != nil {
		fmt.Printf("❌ Ошибка проверки здоровья: %v\n", err)
		return
	}
	fmt.Println("✅ Сервис работает")

	// Тест 2: Проверка поддерживаемых языков
	fmt.Println("\n2️⃣ Проверка поддерживаемых языков...")
	if err := testSupportedLanguages(); err != nil {
		fmt.Printf("❌ Ошибка получения языков: %v\n", err)
		return
	}

	// Тест 3: Простой тест Go
	fmt.Println("\n3️⃣ Простой тест Go...")
	if err := testSimpleGo(); err != nil {
		fmt.Printf("❌ Ошибка тестирования Go: %v\n", err)
	}

	fmt.Println("\n🎉 Тестирование завершено!")
}

func testHealth() error {
	resp, err := http.Get("http://localhost:8081/api/v1/health")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("неожиданный статус: %d", resp.StatusCode)
	}

	var health types.HealthResponse
	if err := json.NewDecoder(resp.Body).Decode(&health); err != nil {
		return err
	}

	fmt.Printf("📊 Статус: %s\n", health.Status)
	fmt.Printf("🕐 Время: %s\n", health.Timestamp.Format(time.RFC3339))
	fmt.Printf("🌐 Поддерживаемых языков: %d\n", len(health.Languages))

	return nil
}

func testSupportedLanguages() error {
	resp, err := http.Get("http://localhost:8081/api/v1/health")
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var health types.HealthResponse
	if err := json.NewDecoder(resp.Body).Decode(&health); err != nil {
		return err
	}

	fmt.Println("📋 Поддерживаемые языки:")
	for _, lang := range health.Languages {
		status := "✅"
		if !lang.Available {
			status = "❌"
		}
		fmt.Printf("  %s %s (%s) - %s\n", status, lang.DisplayName, lang.Version, lang.Name)
	}

	return nil
}

func testSimpleGo() error {
	code := `package main

import (
	"fmt"
	"os"
	"bufio"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)
	if scanner.Scan() {
		input := scanner.Text()
		fmt.Printf("Hello, %s!\n", input)
	}
}`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
	}

	request := types.ExecuteCodeRequest{
		Code:      code,
		Language:  "go",
		TestCases: testCases,
		Timeout:   30 * time.Second,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return fmt.Errorf("ошибка маршалинга JSON: %v", err)
	}

	resp, err := http.Post("http://localhost:8081/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("ошибка HTTP запроса: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("ошибка чтения ответа: %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("неожиданный статус %d: %s", resp.StatusCode, string(body))
	}

	var result types.CodeExecutionResult
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("ошибка парсинга JSON: %v", err)
	}

	fmt.Printf("  📊 Результат: %d/%d тестов прошли\n", result.PassedTests, result.TotalTests)
	if result.Success {
		fmt.Printf("  ✅ Все тесты прошли успешно\n")
	} else {
		fmt.Printf("  ❌ Некоторые тесты не прошли\n")
		for i, testResult := range result.TestResults {
			if !testResult.Passed {
				fmt.Printf("    ❌ Тест %d: %s\n", i+1, testResult.Error)
			}
		}
	}

	return nil
}
