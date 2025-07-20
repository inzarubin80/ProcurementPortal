package service

import (
	"bytes"
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"code-executor/internal/app"
	"log"
)

// CodeExecutorService сервис для выполнения кода
type CodeExecutorService struct {
	timeout time.Duration
}

// NewCodeExecutorService создает новый экземпляр сервиса
func NewCodeExecutorService(timeout time.Duration) *CodeExecutorService {
	return &CodeExecutorService{
		timeout: timeout,
	}
}

// ExecuteCode выполняет код на указанном языке и тестирует его
func (s *CodeExecutorService) ExecuteCode(req app.ExecuteCodeRequest) (*app.CodeExecutionResult, error) {
	startTime := time.Now()

	// Проверяем поддержку языка
	if !app.IsSupportedLanguage(req.Language) {
		return nil, fmt.Errorf("unsupported language: %s", req.Language)
	}

	// Создаем временную директорию
	tempDir, err := s.createTempDir()
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Устанавливаем таймаут
	timeout := s.timeout
	if req.Timeout > 0 {
		timeout = req.Timeout
	}

	result := &app.CodeExecutionResult{
		TestResults: make([]app.TestResult, 0),
		TotalTests:  len(req.TestCases),
	}

	// Выбираем метод выполнения в зависимости от языка
	switch strings.ToLower(req.Language) {
	case "go":
		err = s.executeGoCode(tempDir, req.Code, req.TestCases, result, timeout)
	case "javascript", "js":
		err = s.executeJavaScriptCode(tempDir, req.Code, req.TestCases, result, timeout)
	case "python", "py":
		err = s.executePythonCode(tempDir, req.Code, req.TestCases, result, timeout)
	case "java":
		err = s.executeJavaCode(tempDir, req.Code, req.TestCases, result, timeout)
	case "cpp", "c++":
		err = s.executeCppCode(tempDir, req.Code, req.TestCases, result, timeout)
	case "csharp", "c#":
		err = s.executeCSharpCode(tempDir, req.Code, req.TestCases, result, timeout)
	case "rust":
		err = s.executeRustCode(tempDir, req.Code, req.TestCases, result, timeout)
	case "kotlin":
		err = s.executeKotlinCode(tempDir, req.Code, req.TestCases, result, timeout)

	case "typescript", "ts":
		err = s.executeTypeScriptCode(tempDir, req.Code, req.TestCases, result, timeout)
	case "1c", "bsl":
		err = s.execute1CCode(tempDir, req.Code, req.TestCases, result, timeout)
	default:
		return nil, fmt.Errorf("unsupported language: %s", req.Language)
	}

	if err != nil {
		result.Error = err.Error()
		return result, nil
	}

	result.Success = result.PassedTests == result.TotalTests
	result.ExecutionTime = time.Since(startTime)
	return result, nil
}

// ValidateCode проверяет синтаксис кода
func (s *CodeExecutorService) ValidateCode(code, language string) error {
	// Проверяем поддержку языка
	if !app.IsSupportedLanguage(language) {
		return fmt.Errorf("unsupported language: %s", language)
	}

	tempDir, err := s.createTempDir()
	if err != nil {
		return fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tempDir)

	switch strings.ToLower(language) {
	case "go":
		return s.validateGoCode(tempDir, code)
	case "javascript", "js":
		return s.validateJavaScriptCode(tempDir, code)
	case "python", "py":
		return s.validatePythonCode(tempDir, code)
	case "java":
		return s.validateJavaCode(tempDir, code)
	case "cpp", "c++":
		return s.validateCppCode(tempDir, code)
	case "csharp", "c#":
		return s.validateCSharpCode(tempDir, code)
	case "rust":
		return s.validateRustCode(tempDir, code)
	case "kotlin":
		return s.validateKotlinCode(tempDir, code)

	case "typescript", "ts":
		return s.validateTypeScriptCode(tempDir, code)
	case "1c", "bsl":
		return s.validate1CCode(tempDir, code)
	default:
		return fmt.Errorf("unsupported language: %s", language)
	}
}

// GetSupportedLanguages возвращает список поддерживаемых языков
func (s *CodeExecutorService) GetSupportedLanguages() []app.LanguageInfo {
	languages := []app.LanguageInfo{
		{Name: "go", DisplayName: "Go", Version: "1.21", Available: s.checkLanguageAvailable("go")},
		{Name: "javascript", DisplayName: "JavaScript", Version: "18.x", Available: s.checkLanguageAvailable("javascript")},
		{Name: "python", DisplayName: "Python", Version: "3.8+", Available: s.checkLanguageAvailable("python")},
		{Name: "java", DisplayName: "Java", Version: "17+", Available: s.checkLanguageAvailable("java")},
		{Name: "cpp", DisplayName: "C++", Version: "17+", Available: s.checkLanguageAvailable("cpp")},
		{Name: "csharp", DisplayName: "C#", Version: "8.0+", Available: s.checkLanguageAvailable("csharp")},
		{Name: "rust", DisplayName: "Rust", Version: "1.70+", Available: s.checkLanguageAvailable("rust")},
		{Name: "kotlin", DisplayName: "Kotlin", Version: "1.8+", Available: s.checkLanguageAvailable("kotlin")},

		{Name: "typescript", DisplayName: "TypeScript", Version: "5.0+", Available: s.checkLanguageAvailable("typescript")},
		{Name: "1c", DisplayName: "1С", Version: "1.4", Available: s.checkLanguageAvailable("1c")},
	}
	return languages
}

// executeGoCode выполняет код Go
func (s *CodeExecutorService) executeGoCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом
	mainFile := filepath.Join(tempDir, "main.go")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Компилируем код
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "build", "-o", "program", "main.go")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[GO][COMPILE] Ошибка компиляции: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("compilation error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	// После успешной компиляции делаем программу исполняемой
	if err := os.Chmod(filepath.Join(tempDir, "program"), 0755); err != nil {
		log.Printf("[GO][CHMOD] Ошибка установки прав доступа: %v", err)
	}
	os.Chown(filepath.Join(tempDir, "program"), 1000, 1000)

	// Запускаем тесты
	for _, testCase := range testCases {
		testResult := s.runGoTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[GO][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[GO][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// executeJavaCode выполняет код Java
func (s *CodeExecutorService) executeJavaCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом
	mainFile := filepath.Join(tempDir, "Main.java")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Компилируем код
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "javac", "Main.java")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[JAVA][COMPILE] Ошибка компиляции: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("compilation error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	// Запускаем тесты
	for _, testCase := range testCases {
		testResult := s.runJavaTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[JAVA][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[JAVA][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// executeCppCode выполняет код C++
func (s *CodeExecutorService) executeCppCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом
	mainFile := filepath.Join(tempDir, "main.cpp")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Компилируем код
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "g++", "-o", "program", "main.cpp")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[CPP][COMPILE] Ошибка компиляции: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("compilation error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	// После успешной компиляции делаем программу исполняемой
	if err := os.Chmod(filepath.Join(tempDir, "program"), 0755); err != nil {
		log.Printf("[CPP][CHMOD] Ошибка установки прав доступа: %v", err)
	}
	os.Chown(filepath.Join(tempDir, "program"), 1000, 1000)

	// Запускаем тесты
	for _, testCase := range testCases {
		testResult := s.runCppTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[CPP][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[CPP][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// executeCSharpCode выполняет код C#
func (s *CodeExecutorService) executeCSharpCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем временный dotnet-проект
	dotnetProjectDir := filepath.Join(tempDir, "dotnet_project")
	if err := os.MkdirAll(dotnetProjectDir, 0755); err != nil {
		return fmt.Errorf("failed to create dotnet project dir: %w", err)
	}
	defer os.RemoveAll(dotnetProjectDir)

	// Создаем файл с кодом
	mainFile := filepath.Join(dotnetProjectDir, "Program.cs")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Компилируем и запускаем код
	for _, testCase := range testCases {
		testResult := s.runCSharpTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[CSHARP][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[CSHARP][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// executeRustCode выполняет код Rust
func (s *CodeExecutorService) executeRustCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом
	mainFile := filepath.Join(tempDir, "main.rs")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Компилируем код
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "rustc", "-o", "program", "main.rs")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[RUST][COMPILE] Ошибка компиляции: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("compilation error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	// После успешной компиляции делаем программу исполняемой
	if err := os.Chmod(filepath.Join(tempDir, "program"), 0755); err != nil {
		log.Printf("[RUST][CHMOD] Ошибка установки прав доступа: %v", err)
	}
	os.Chown(filepath.Join(tempDir, "program"), 1000, 1000)

	// Запускаем тесты
	for _, testCase := range testCases {
		testResult := s.runRustTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[RUST][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[RUST][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// executeKotlinCode выполняет код Kotlin
func (s *CodeExecutorService) executeKotlinCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом
	mainFile := filepath.Join(tempDir, "Main.kt")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Компилируем и запускаем код
	for _, testCase := range testCases {
		testResult := s.runKotlinTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[KOTLIN][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[KOTLIN][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// executeTypeScriptCode выполняет код TypeScript
func (s *CodeExecutorService) executeTypeScriptCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом
	mainFile := filepath.Join(tempDir, "main.ts")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Компилируем TypeScript в JavaScript
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "tsc", "main.ts")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[TS][COMPILE] Ошибка компиляции: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("compilation error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	// Запускаем тесты
	for _, testCase := range testCases {
		testResult := s.runTypeScriptTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[TS][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[TS][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// Существующие методы для Go, JavaScript, Python, 1С остаются без изменений
// ... existing code ...

// runGoTestCase запускает Go программу с тестовыми данными
func (s *CodeExecutorService) runGoTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, filepath.Join(tempDir, "program"))
	cmd.Dir = tempDir
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[GO][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// runJavaTestCase запускает Java программу с тестовыми данными
func (s *CodeExecutorService) runJavaTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "java", "Main")
	cmd.Dir = tempDir
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[JAVA][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// runCppTestCase запускает C++ программу с тестовыми данными
func (s *CodeExecutorService) runCppTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, filepath.Join(tempDir, "program"))
	cmd.Dir = tempDir
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[CPP][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// runCSharpTestCase запускает C# программу с тестовыми данными
func (s *CodeExecutorService) runCSharpTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "dotnet", "run", "--project", tempDir)
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[CSHARP][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// runRustTestCase запускает Rust программу с тестовыми данными
func (s *CodeExecutorService) runRustTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, filepath.Join(tempDir, "program"))
	cmd.Dir = tempDir
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[RUST][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// runKotlinTestCase запускает Kotlin программу с тестовыми данными
func (s *CodeExecutorService) runKotlinTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "kotlin", "MainKt")
	cmd.Dir = tempDir
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[KOTLIN][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// runTypeScriptTestCase запускает TypeScript программу с тестовыми данными
func (s *CodeExecutorService) runTypeScriptTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "node", "main.js")
	cmd.Dir = tempDir
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[TS][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// executeJavaScriptCode выполняет код JavaScript
func (s *CodeExecutorService) executeJavaScriptCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом
	mainFile := filepath.Join(tempDir, "main.js")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Запускаем тесты
	for _, testCase := range testCases {
		testResult := s.runJavaScriptTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[JS][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[JS][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// runJavaScriptTestCase запускает JavaScript программу с тестовыми данными
func (s *CodeExecutorService) runJavaScriptTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "node", "main.js")
	cmd.Dir = tempDir
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[JS][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// executePythonCode выполняет код Python
func (s *CodeExecutorService) executePythonCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом
	mainFile := filepath.Join(tempDir, "main.py")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Запускаем тесты
	for _, testCase := range testCases {
		testResult := s.runPythonTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[PYTHON][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[PYTHON][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// runPythonTestCase запускает Python программу с тестовыми данными
func (s *CodeExecutorService) runPythonTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	cmd := exec.CommandContext(ctx, "python3", "main.py")
	cmd.Dir = tempDir
	cmd.Stdin = strings.NewReader(testCase.Input)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[PYTHON][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// execute1CCode выполняет код 1С
func (s *CodeExecutorService) execute1CCode(tempDir, code string, testCases []app.TestCase, result *app.CodeExecutionResult, timeout time.Duration) error {
	// Создаем файл с кодом 1С
	mainFile := filepath.Join(tempDir, "main.bsl")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	// Запускаем тесты
	for _, testCase := range testCases {
		testResult := s.run1CTestCase(tempDir, testCase, timeout)
		result.TestResults = append(result.TestResults, testResult)
		if testResult.Passed {
			result.PassedTests++
			log.Printf("[1C][TEST][SUCCESS] Input: %q | Expected: %q | Output: %q", testCase.Input, testCase.Output, testResult.UserOutput)
		} else {
			log.Printf("[1C][TEST][FAIL] Input: %q | Expected: %q | Output: %q | Error: %s", testCase.Input, testCase.Output, testResult.UserOutput, testResult.Error)
		}
	}

	return nil
}

// run1CTestCase запускает 1С программу с тестовыми данными
func (s *CodeExecutorService) run1CTestCase(tempDir string, testCase app.TestCase, timeout time.Duration) app.TestResult {
	result := app.TestResult{
		TestCase: testCase,
		Expected: testCase.Output,
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// Запускаем 1С в режиме командной строки
	cmd := exec.CommandContext(ctx, "oscript", "main.bsl")
	cmd.Dir = tempDir

	// Передаем входные данные через переменную окружения
	cmd.Env = append(os.Environ(), fmt.Sprintf("INPUT_DATA=%s", testCase.Input))

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	userOutput := strings.TrimSpace(stdout.String())
	result.UserOutput = userOutput

	if err != nil {
		log.Printf("[1C][RUN] Ошибка выполнения теста: %v\nSTDERR: %s\nSTDOUT: %s", err, stderr.String(), stdout.String())
		result.Error = fmt.Sprintf("Runtime error: %v\nStderr: %s", err, stderr.String())
		result.Passed = false
		return result
	}

	result.Passed = s.normalizeOutput(userOutput) == s.normalizeOutput(testCase.Output)
	return result
}

// Методы валидации для всех языков
func (s *CodeExecutorService) validateGoCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "main.go")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "go", "build", "-o", "/dev/null", "main.go")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[GO][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validateJavaScriptCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "main.js")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "node", "-c", "main.js")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[JS][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validatePythonCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "main.py")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "python3", "-m", "py_compile", "main.py")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[PYTHON][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validateJavaCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "Main.java")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "javac", "Main.java")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[JAVA][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validateCppCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "main.cpp")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "g++", "-fsyntax-only", "main.cpp")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[CPP][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validateCSharpCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "Program.cs")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "dotnet", "build", "--no-restore")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[CSHARP][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validateRustCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "main.rs")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "rustc", "--check", "main.rs")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[RUST][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validateKotlinCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "Main.kt")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "kotlinc", "-no-stdlib", "Main.kt")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[KOTLIN][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validateTypeScriptCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "main.ts")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "tsc", "--noEmit", "main.ts")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[TS][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

func (s *CodeExecutorService) validate1CCode(tempDir, code string) error {
	mainFile := filepath.Join(tempDir, "main.bsl")
	if err := ioutil.WriteFile(mainFile, []byte(code), 0644); err != nil {
		return fmt.Errorf("failed to write code file: %w", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Проверяем синтаксис с помощью OneScript
	cmd := exec.CommandContext(ctx, "oscript", "-check", "main.bsl")
	cmd.Dir = tempDir
	cmd.Stderr = &bytes.Buffer{}
	cmd.Stdout = &bytes.Buffer{}

	if err := cmd.Run(); err != nil {
		log.Printf("[1C][VALIDATE] Ошибка синтаксиса: %v\nSTDERR: %s\nSTDOUT: %s", err, cmd.Stderr.(*bytes.Buffer).String(), cmd.Stdout.(*bytes.Buffer).String())
		return fmt.Errorf("syntax error: %v, stderr: %s", err, cmd.Stderr.(*bytes.Buffer).String())
	}

	return nil
}

// createTempDir создает временную директорию с уникальным именем
func (s *CodeExecutorService) createTempDir() (string, error) {
	return ioutil.TempDir("", "code-executor-*")
}

// normalizeOutput нормализует вывод для сравнения
func (s *CodeExecutorService) normalizeOutput(output string) string {
	return strings.TrimSpace(strings.ReplaceAll(output, "\r\n", "\n"))
}

// checkLanguageAvailable проверяет доступность языка программирования
func (s *CodeExecutorService) checkLanguageAvailable(language string) bool {
	var cmd *exec.Cmd

	switch language {
	case "go":
		cmd = exec.Command("go", "version")
	case "javascript":
		cmd = exec.Command("node", "--version")
	case "python":
		cmd = exec.Command("python3", "--version")
	case "java":
		cmd = exec.Command("java", "-version")
	case "cpp":
		cmd = exec.Command("g++", "--version")
	case "csharp":
		cmd = exec.Command("dotnet", "--version")
	case "rust":
		cmd = exec.Command("rustc", "--version")
	case "kotlin":
		cmd = exec.Command("kotlin", "-version")

	case "typescript":
		cmd = exec.Command("tsc", "--version")
	case "1c":
		cmd = exec.Command("oscript", "--version")
	default:
		return false
	}

	return cmd.Run() == nil
}
