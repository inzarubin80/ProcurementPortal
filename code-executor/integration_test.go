package docker

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"testing"
	"time"

	"code-executor/internal/app"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

var integrationTestBaseURL = "http://localhost:8081"

// CodeExecutorTestSuite набор тестов для микросервиса code-executor
type CodeExecutorTestSuite struct {
	suite.Suite
	client *http.Client
}

// SetupSuite настройка тестового набора
func (suite *CodeExecutorTestSuite) SetupSuite() {
	suite.client = &http.Client{
		Timeout: 30 * time.Second,
	}
}

// TestHealth проверяет здоровье сервиса
func (suite *CodeExecutorTestSuite) TestHealth() {
	resp, err := suite.client.Get(integrationTestBaseURL + "/api/v1/health")
	require.NoError(suite.T(), err, "Ошибка подключения к сервису")
	defer resp.Body.Close()

	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode, "Неожиданный статус")

	var health app.HealthResponse
	err = json.NewDecoder(resp.Body).Decode(&health)
	require.NoError(suite.T(), err, "Ошибка парсинга JSON")

	assert.Equal(suite.T(), "healthy", health.Status, "Ожидался статус 'healthy'")
	assert.NotEmpty(suite.T(), health.Languages, "Список языков не должен быть пустым")

	suite.T().Logf("✅ Сервис здоров, поддерживаемых языков: %d", len(health.Languages))
}

// TestGoExecution тестирует выполнение Go кода
func (suite *CodeExecutorTestSuite) TestGoExecution() {
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

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Go", Output: "Hello, Go!"},
	}

	result := suite.executeCode("go", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест Go должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ Go тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestPythonExecution тестирует выполнение Python кода
func (suite *CodeExecutorTestSuite) TestPythonExecution() {
	code := `import sys

name = input().strip()
print(f"Hello, {name}!")`

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Python", Output: "Hello, Python!"},
	}

	result := suite.executeCode("python", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест Python должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ Python тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestJavaScriptExecution тестирует выполнение JavaScript кода
func (suite *CodeExecutorTestSuite) TestJavaScriptExecution() {
	code := `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  console.log("Hello, " + input + "!");
  rl.close();
});`

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "JavaScript", Output: "Hello, JavaScript!"},
	}

	result := suite.executeCode("javascript", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест JavaScript должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ JavaScript тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestJavaExecution тестирует выполнение Java кода
func (suite *CodeExecutorTestSuite) TestJavaExecution() {
	code := `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println("Hello, " + input + "!");
        scanner.close();
    }
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Java", Output: "Hello, Java!"},
	}

	result := suite.executeCode("java", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест Java должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ Java тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestCppExecution тестирует выполнение C++ кода
func (suite *CodeExecutorTestSuite) TestCppExecution() {
	code := `#include <iostream>
#include <string>

int main() {
    std::string input;
    std::getline(std::cin, input);
    std::cout << "Hello, " << input << "!" << std::endl;
    return 0;
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "C++", Output: "Hello, C++!"},
	}

	result := suite.executeCode("cpp", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест C++ должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ C++ тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestCSharpExecution тестирует выполнение C# кода
func (suite *CodeExecutorTestSuite) TestCSharpExecution() {
	code := `using System;

class Program
{
    static void Main()
    {
        string input = Console.ReadLine();
        Console.WriteLine($"Hello, {input}!");
    }
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "C#", Output: "Hello, C#!"},
	}

	result := suite.executeCode("csharp", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест C# должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ C# тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestRustExecution тестирует выполнение Rust кода
func (suite *CodeExecutorTestSuite) TestRustExecution() {
	code := `use std::io;

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let input = input.trim();
    println!("Hello, {}!", input);
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Rust", Output: "Hello, Rust!"},
	}

	result := suite.executeCode("rust", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест Rust должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ Rust тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestKotlinExecution тестирует выполнение Kotlin кода
func (suite *CodeExecutorTestSuite) TestKotlinExecution() {
	code := "import java.util.Scanner\n\nfun main() {\n    val scanner = Scanner(System.`in`)\n    val input = scanner.nextLine()\n    println(\"Hello, $input!\")\n    scanner.close()\n}"

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Kotlin", Output: "Hello, Kotlin!"},
	}

	result := suite.executeCode("kotlin", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест Kotlin должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ Kotlin тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestTypeScriptExecution тестирует выполнение TypeScript кода
func (suite *CodeExecutorTestSuite) TestTypeScriptExecution() {
	code := `import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input: string) => {
  console.log("Hello, " + input + "!");
  rl.close();
});`

	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "TypeScript", Output: "Hello, TypeScript!"},
	}

	result := suite.executeCode("typescript", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест TypeScript должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")

	suite.T().Logf("✅ TypeScript тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// Test1CExecution тестирует выполнение 1С кода
func (suite *CodeExecutorTestSuite) Test1CExecution() {
	code := `
     Сообщить("Мир");`
	testCases := []app.TestCase{
		{ID: 1, Name: "Test 1", Input: "Мир", Output: "Мир"},
		{ID: 2, Name: "Test 2", Input: "1С", Output: "Мир"},
	}
	result := suite.executeCode("1c", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.True(suite.T(), result.Success, "Тест 1С должен пройти успешно")
	assert.Equal(suite.T(), len(testCases), result.PassedTests, "Все тесты должны пройти")
	for _, r := range result.TestResults {
		suite.T().Logf("1C output: '%s' (expected: '%s')", r.UserOutput, r.Expected)
	}
	suite.T().Logf("✅ 1С тест прошел: %d/%d тестов", result.PassedTests, result.TotalTests)
}

// TestValidation тестирует валидацию синтаксиса
func (suite *CodeExecutorTestSuite) TestValidation() {
	tests := []struct {
		name     string
		language string
		code     string
		valid    bool
	}{
		{
			name:     "Valid Go code",
			language: "go",
			code: `package main
import "fmt"
func main() { fmt.Println("Hello") }`,
			valid: true,
		},
		{
			name:     "Invalid Go code",
			language: "go",
			code:     `package main; func main() { fmt.Println("Hello" }`,
			valid:    false,
		},
		{
			name:     "Valid Python code",
			language: "python",
			code:     `print("Hello, World!")`,
			valid:    true,
		},
		{
			name:     "Invalid Python code",
			language: "python",
			code:     `print("Hello, World!"`,
			valid:    false,
		},
		{
			name:     "Valid JavaScript code",
			language: "javascript",
			code:     `console.log("Hello, World!");`,
			valid:    true,
		},
		{
			name:     "Invalid JavaScript code",
			language: "javascript",
			code:     `console.log("Hello, World!"`,
			valid:    false,
		},
	}

	for _, test := range tests {
		suite.T().Run(test.name, func(t *testing.T) {
			req := app.ValidateCodeRequest{
				Code:     test.code,
				Language: test.language,
			}

			jsonData, err := json.Marshal(req)
			require.NoError(t, err, "Ошибка маршалинга JSON")

			resp, err := suite.client.Post(integrationTestBaseURL+"/api/v1/validate", "application/json", bytes.NewBuffer(jsonData))
			require.NoError(t, err, "Ошибка отправки запроса")
			defer resp.Body.Close()

			assert.Equal(t, http.StatusOK, resp.StatusCode, "Неожиданный статус")

			var result app.ValidateCodeResponse
			err = json.NewDecoder(resp.Body).Decode(&result)
			require.NoError(t, err, "Ошибка парсинга JSON")

			assert.Equal(t, test.valid, result.Valid, "Результат валидации не соответствует ожиданию")
		})
	}
}

// TestErrorHandling тестирует обработку ошибок
func (suite *CodeExecutorTestSuite) TestErrorHandling() {
	// Тест с неподдерживаемым языком
	req := app.ExecuteCodeRequest{
		Code:     `print("Hello")`,
		Language: "unsupported_language",
		TestCases: []app.TestCase{
			{ID: 1, Name: "Test", Input: "test", Output: "test"},
		},
	}

	result := suite.executeCode("unsupported_language", req.Code, req.TestCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.False(suite.T(), result.Success, "Тест с неподдерживаемым языком должен завершиться с ошибкой")
	assert.NotEmpty(suite.T(), result.Error, "Должна быть ошибка")

	// Тест с некорректным JSON
	resp, err := suite.client.Post(integrationTestBaseURL+"/api/v1/execute", "application/json", bytes.NewBufferString(`{"invalid": "json"`))
	require.NoError(suite.T(), err, "Ошибка отправки запроса")
	defer resp.Body.Close()

	assert.Equal(suite.T(), http.StatusBadRequest, resp.StatusCode, "Ожидался статус BadRequest")
}

// TestTimeoutHandling тестирует обработку таймаутов
func (suite *CodeExecutorTestSuite) TestTimeoutHandling() {
	// Бесконечный цикл для тестирования таймаута
	code := `package main

import "time"

func main() {
    for {
        time.Sleep(1 * time.Second)
    }
}`

	testCases := []app.TestCase{
		{ID: 1, Name: "Timeout test", Input: "", Output: ""},
	}

	result := suite.executeCode("go", code, testCases)
	require.NotNil(suite.T(), result, "Результат выполнения не должен быть nil")
	assert.False(suite.T(), result.Success, "Тест с таймаутом должен завершиться с ошибкой")
}

// executeCode вспомогательная функция для выполнения кода
func (suite *CodeExecutorTestSuite) executeCode(language, code string, testCases []app.TestCase) *app.CodeExecutionResult {
	req := app.ExecuteCodeRequest{
		Code:      code,
		Language:  language,
		TestCases: testCases,
		Timeout:   10 * time.Second,
	}

	jsonData, err := json.Marshal(req)
	require.NoError(suite.T(), err, "Ошибка маршалинга JSON")

	resp, err := suite.client.Post(integrationTestBaseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
	require.NoError(suite.T(), err, "Ошибка отправки запроса")
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		suite.T().Logf("Ошибка выполнения кода: %s", string(body))
		return nil
	}

	var result app.CodeExecutionResult
	err = json.NewDecoder(resp.Body).Decode(&result)
	require.NoError(suite.T(), err, "Ошибка парсинга JSON")

	return &result
}

// TestMain точка входа для тестов
func TestMain(m *testing.M) {
	// Проверяем доступность сервиса перед запуском тестов
	client := &http.Client{Timeout: 5 * time.Second}

	// Ждем запуска сервиса
	for i := 0; i < 30; i++ {
		resp, err := client.Get(integrationTestBaseURL + "/api/v1/health")
		if err == nil && resp.StatusCode == http.StatusOK {
			fmt.Println("✅ Сервис code-executor доступен")
			break
		}
		time.Sleep(1 * time.Second)
	}

	// Запускаем тесты
	os.Exit(m.Run())
}

// TestCodeExecutorSuite запуск тестового набора
func TestCodeExecutorSuite(t *testing.T) {
	suite.Run(t, new(CodeExecutorTestSuite))
}
