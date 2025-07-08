package model

import (
	"time"

	"github.com/golang-jwt/jwt"
)

const (
	Access_Token_Type  = "access_token"
	Refresh_Token_Type = "refresh_Token"

	// Константы для языков программирования
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

	// Константы для статуса упражнений
	ExerciseStatusNotStarted = "not_started"
	ExerciseStatusInProgress = "in_progress"
	ExerciseStatusCompleted  = "completed"
	ExerciseStatusSkipped    = "skipped"

	// Константы для статуса категорий
	CategoryStatusActive   = "active"
	CategoryStatusInactive = "inactive"
	CategoryStatusArchived = "archived"
)

type (
	UserID                  int64
	ProgrammingLanguage     string
	ExerciseStatus          string
	CategoryID              int64
	UserProfileFromProvider struct {
		ProviderID   string `json:"provider_id"`   // Идентификатор пользователя у провайдера
		Email        string `json:"email"`         // Email пользователя
		Name         string `json:"name"`          // Имя пользователя
		FirstName    string `json:"first_name"`    // Имя
		LastName     string `json:"last_name"`     // Фамилия
		AvatarURL    string `json:"avatar_url"`    // Ссылка на аватар
		ProviderName string `json:"provider_name"` // Название провайдера (например, "google", "github")
	}

	User struct {
		ID                 UserID
		Name               string
		EvaluationStrategy string
		MaximumScore       int
	}

	UserAuthProviders struct {
		UserID      UserID
		ProviderUid string
		Provider    string
		Name        string
	}

	AuthData struct {
		UserID       UserID
		RefreshToken string
		AccessToken  string
	}

	Claims struct {
		UserID    UserID `json:"user_id"`
		TokenType string `json:"token_type"` // Добавляем поле для типа токена
		jwt.StandardClaims
	}

	Exercise struct {
		ID                  int64               `json:"id"`
		UserID              UserID              `json:"user_id"` // кто создал
		Title               string              `json:"title"`
		Description         string              `json:"description"`
		CategoryID          int64               `json:"category_id"`
		ProgrammingLanguage ProgrammingLanguage `json:"programming_language"`
		CodeToRemember      string              `json:"code_to_remember"` // код для запоминания
		CreatedAt           time.Time           `json:"created_at"`
		UpdatedAt           time.Time           `json:"updated_at"`
		IsActive            bool                `json:"is_active"`
		SuccessfulAttempts  *int                `json:"successful_attempts,omitempty"`
	}

	Category struct {
		ID                  int64               `json:"id"`
		UserID              UserID              `json:"user_id"` // кто создал
		Name                string              `json:"name"`
		Description         string              `json:"description"`
		ProgrammingLanguage ProgrammingLanguage `json:"programming_language"` // язык программирования
		Color               string              `json:"color"`                // цвет для UI
		Icon                string              `json:"icon"`                 // иконка для UI
		Status              string              `json:"status"`               // active, inactive, archived
		CreatedAt           time.Time           `json:"created_at"`
		UpdatedAt           time.Time           `json:"updated_at"`
		IsActive            bool                `json:"is_active"`
	}

	CategoryListResponse struct {
		Categories []*Category `json:"categories"`
		Total      int         `json:"total"`
		Page       int         `json:"page"`
		PageSize   int         `json:"page_size"`
		HasNext    bool        `json:"has_next"`
		HasPrev    bool        `json:"has_prev"`
	}

	// ExerciseStat хранит статистику пользователя по задаче
	ExerciseStat struct {
		UserID             UserID `json:"user_id"`
		ExerciseID         int64  `json:"exercise_id"`
		TotalAttempts      int    `json:"total_attempts"`
		SuccessfulAttempts int    `json:"successful_attempts"`
		TotalTypingTime    int64  `json:"total_typing_time"` // в секундах
		TotalTypedChars    int    `json:"total_typed_chars"`
	}

	// UserStats хранит агрегированную статистику пользователя
	UserStats struct {
		UserID             UserID `json:"user_id"`
		TotalExercises     int    `json:"total_exercises"`
		CompletedExercises int    `json:"completed_exercises"`
		AverageScore       int    `json:"average_score"`
		TotalTime          int64  `json:"total_time"`
		TotalAttempts      int    `json:"total_attempts"`
	}

	ExerciseStatUpdate struct {
		UserID          UserID `json:"user_id"`
		ExerciseID      int64  `json:"exercise_id"`
		Attempts        int    `json:"attempts"`         // всегда 1
		SuccessAttempts int    `json:"success_attempts"` // 1 если успешно, 0 если нет
		TypingTime      int64  `json:"typing_time"`      // в секундах
		TypedChars      int    `json:"typed_chars"`
	}

	// UserExercise представляет связь пользователя с упражнением
	UserExercise struct {
		UserID        UserID     `json:"user_id"`
		ExerciseID    int64      `json:"exercise_id"`
		CompletedAt   *time.Time `json:"completed_at"`
		Score         *int       `json:"score"`
		AttemptsCount int        `json:"attempts_count"`
		CreatedAt     time.Time  `json:"created_at"`
		UpdatedAt     time.Time  `json:"updated_at"`
	}

	UserInfo struct {
		IsSolved       bool `json:"is_solved"`
		IsUserExercise bool `json:"is_user_exercise"`
	}

	ExerciseDetailse struct {
		UserIfo  UserInfo `json:"user_info"`
		Exercise Exercise `json:"exercise"`
	}

	ExerciseListWithUserResponse struct {
		ExeExerciseDetailse []*ExerciseDetailse `json:"exercise_detailse"`
		Total               int                 `json:"total"`
		Page                int                 `json:"page"`
		PageSize            int                 `json:"page_size"`
		HasNext             bool                `json:"has_next"`
		HasPrev             bool                `json:"has_prev"`
	}
)

// GetSupportedLanguages возвращает список поддерживаемых языков программирования
func GetSupportedLanguages() []ProgrammingLanguage {
	return []ProgrammingLanguage{
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
func IsSupportedLanguage(language ProgrammingLanguage) bool {
	supported := GetSupportedLanguages()
	for _, supportedLang := range supported {
		if supportedLang == language {
			return true
		}
	}
	return false
}
