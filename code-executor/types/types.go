package types

import "time"

// ExecuteCodeRequest запрос на выполнение кода
type ExecuteCodeRequest struct {
	Code      string        `json:"code" binding:"required"`
	Language  string        `json:"language" binding:"required"`
	TestCases []TestCase    `json:"test_cases" binding:"required"`
	Timeout   time.Duration `json:"timeout,omitempty"`
}

// ValidateCodeRequest запрос на валидацию синтаксиса
type ValidateCodeRequest struct {
	Code     string `json:"code" binding:"required"`
	Language string `json:"language" binding:"required"`
}

// TestCase тестовый случай
type TestCase struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Input  string `json:"input"`
	Output string `json:"output"`
}

// TestResult результат выполнения теста
type TestResult struct {
	TestCase   TestCase `json:"test_case"`
	UserOutput string   `json:"user_output"`
	Expected   string   `json:"expected"`
	Passed     bool     `json:"passed"`
	Error      string   `json:"error,omitempty"`
}

// CodeExecutionResult результат выполнения кода
type CodeExecutionResult struct {
	Success       bool          `json:"success"`
	TotalTests    int           `json:"total_tests"`
	PassedTests   int           `json:"passed_tests"`
	TestResults   []TestResult  `json:"test_results"`
	ExecutionTime time.Duration `json:"execution_time,omitempty"`
	Error         string        `json:"error,omitempty"`
}

// ValidateCodeResponse ответ на валидацию кода
type ValidateCodeResponse struct {
	Valid bool   `json:"valid"`
	Error string `json:"error,omitempty"`
}

// HealthResponse ответ на проверку здоровья сервиса
type HealthResponse struct {
	Status    string         `json:"status"`
	Timestamp time.Time      `json:"timestamp"`
	Languages []LanguageInfo `json:"languages"`
}

// LanguageInfo информация о поддерживаемом языке
type LanguageInfo struct {
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
	Version     string `json:"version"`
	Available   bool   `json:"available"`
}

// Константы для языков программирования
const (
	LanguagePython     = "python"
	LanguageJavaScript = "javascript"
	LanguageJava       = "java"
	LanguageCpp        = "cpp"
	LanguageCSharp     = "csharp"
	LanguageGo         = "go"
	LanguageRust       = "rust"
	LanguageKotlin     = "kotlin"
	LanguageSwift      = "swift"
	LanguageTypeScript = "typescript"
	Language1C         = "1c"
)

// GetSupportedLanguages возвращает список поддерживаемых языков программирования
func GetSupportedLanguages() []string {
	return []string{
		LanguagePython,
		LanguageJavaScript,
		LanguageJava,
		LanguageCpp,
		LanguageCSharp,
		LanguageGo,
		LanguageRust,
		LanguageKotlin,
		LanguageSwift,
		LanguageTypeScript,
		Language1C,
	}
}

// IsSupportedLanguage проверяет, поддерживается ли язык программирования
func IsSupportedLanguage(language string) bool {
	supported := GetSupportedLanguages()
	for _, supportedLang := range supported {
		if supportedLang == language {
			return true
		}
	}
	return false
}
