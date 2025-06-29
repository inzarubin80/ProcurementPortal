package model

import (
	"github.com/golang-jwt/jwt"
	
)

const (
	Access_Token_Type         = "access_token"
	Refresh_Token_Type        = "refresh_Token"
	)

type (
	UserID int64

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

)

