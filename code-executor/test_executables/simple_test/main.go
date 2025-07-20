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
	baseURL := "http://localhost:8080"

	fmt.Println("🧪 Тестирование микросервиса code-executor")
	fmt.Println("==========================================")

	// Тест 1: Проверка здоровья сервиса
	fmt.Println("\n1️⃣ Проверка здоровья сервиса...")
	if err := testHealth(baseURL); err != nil {
		fmt.Printf("❌ Ошибка проверки здоровья: %v\n", err)
		return
	}
	fmt.Println("✅ Сервис работает")

	// Тест 2: Проверка поддерживаемых языков
	fmt.Println("\n2️⃣ Проверка поддерживаемых языков...")
	if err := testSupportedLanguages(baseURL); err != nil {
		fmt.Printf("❌ Ошибка получения языков: %v\n", err)
		return
	}

	// Тест 3: Тестирование Go
	fmt.Println("\n3️⃣ Тестирование Go...")
	if err := testGo(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования Go: %v\n", err)
	}

	// Тест 4: Тестирование Python
	fmt.Println("\n4️⃣ Тестирование Python...")
	if err := testPython(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования Python: %v\n", err)
	}

	// Тест 5: Тестирование JavaScript
	fmt.Println("\n5️⃣ Тестирование JavaScript...")
	if err := testJavaScript(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования JavaScript: %v\n", err)
	}

	// Тест 6: Тестирование Java
	fmt.Println("\n6️⃣ Тестирование Java...")
	if err := testJava(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования Java: %v\n", err)
	}

	// Тест 7: Тестирование C++
	fmt.Println("\n7️⃣ Тестирование C++...")
	if err := testCpp(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования C++: %v\n", err)
	}

	// Тест 8: Тестирование C#
	fmt.Println("\n8️⃣ Тестирование C#...")
	if err := testCSharp(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования C#: %v\n", err)
	}

	// Тест 9: Тестирование Rust
	fmt.Println("\n9️⃣ Тестирование Rust...")
	if err := testRust(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования Rust: %v\n", err)
	}

	// Тест 10: Тестирование Kotlin
	fmt.Println("\n🔟 Тестирование Kotlin...")
	if err := testKotlin(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования Kotlin: %v\n", err)
	}

	// Тест 11: Тестирование Swift
	fmt.Println("\n1️⃣1️⃣ Тестирование Swift...")
	if err := testSwift(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования Swift: %v\n", err)
	}

	// Тест 12: Тестирование TypeScript
	fmt.Println("\n1️⃣2️⃣ Тестирование TypeScript...")
	if err := testTypeScript(baseURL); err != nil {
		fmt.Printf("❌ Ошибка тестирования TypeScript: %v\n", err)
	}

	fmt.Println("\n🎉 Тестирование завершено!")
}

func testHealth(baseURL string) error {
	resp, err := http.Get(baseURL + "/api/v1/health")
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

func testSupportedLanguages(baseURL string) error {
	resp, err := http.Get(baseURL + "/api/v1/health")
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

func testGo(baseURL string) error {
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
		{ID: 2, Name: "Test 2", Input: "Go", Output: "Hello, Go!"},
	}

	return executeCode(baseURL, "go", code, testCases)
}

func testPython(baseURL string) error {
	code := `import sys

name = input().strip()
print(f"Hello, {name}!")`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Python", Output: "Hello, Python!"},
	}

	return executeCode(baseURL, "python", code, testCases)
}

func testJavaScript(baseURL string) error {
	code := `const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  console.log("Hello, " + input + "!");
  rl.close();
});`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "JavaScript", Output: "Hello, JavaScript!"},
	}

	return executeCode(baseURL, "javascript", code, testCases)
}

func testJava(baseURL string) error {
	code := `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.nextLine();
        System.out.println("Hello, " + input + "!");
        scanner.close();
    }
}`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Java", Output: "Hello, Java!"},
	}

	return executeCode(baseURL, "java", code, testCases)
}

func testCpp(baseURL string) error {
	code := `#include <iostream>
#include <string>

int main() {
    std::string input;
    std::getline(std::cin, input);
    std::cout << "Hello, " << input << "!" << std::endl;
    return 0;
}`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "C++", Output: "Hello, C++!"},
	}

	return executeCode(baseURL, "cpp", code, testCases)
}

func testCSharp(baseURL string) error {
	code := `using System;

class Program
{
    static void Main()
    {
        string input = Console.ReadLine();
        Console.WriteLine($"Hello, {input}!");
    }
}`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "C#", Output: "Hello, C#!"},
	}

	return executeCode(baseURL, "csharp", code, testCases)
}

func testRust(baseURL string) error {
	code := `use std::io;

fn main() {
    let mut input = String::new();
    io::stdin().read_line(&mut input).unwrap();
    let input = input.trim();
    println!("Hello, {}!", input);
}`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Rust", Output: "Hello, Rust!"},
	}

	return executeCode(baseURL, "rust", code, testCases)
}

func testKotlin(baseURL string) error {
	code := `fun main() {
    val input = readLine() ?: ""
    println("Hello, $input!")
}`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Kotlin", Output: "Hello, Kotlin!"},
	}

	return executeCode(baseURL, "kotlin", code, testCases)
}

func testSwift(baseURL string) error {
	code := `import Foundation

if let input = readLine() {
    print("Hello, \\(input)!")
}`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "Swift", Output: "Hello, Swift!"},
	}

	return executeCode(baseURL, "swift", code, testCases)
}

func testTypeScript(baseURL string) error {
	code := `import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input: string) => {
  console.log("Hello, " + input + "!");
  rl.close();
});`

	testCases := []types.TestCase{
		{ID: 1, Name: "Test 1", Input: "World", Output: "Hello, World!"},
		{ID: 2, Name: "Test 2", Input: "TypeScript", Output: "Hello, TypeScript!"},
	}

	return executeCode(baseURL, "typescript", code, testCases)
}

func executeCode(baseURL, language, code string, testCases []types.TestCase) error {
	request := types.ExecuteCodeRequest{
		Code:      code,
		Language:  language,
		TestCases: testCases,
		Timeout:   30 * time.Second,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return fmt.Errorf("ошибка маршалинга JSON: %v", err)
	}

	resp, err := http.Post(baseURL+"/api/v1/execute", "application/json", bytes.NewBuffer(jsonData))
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
