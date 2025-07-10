package tokenservice

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"inzarubin80/MemCode/internal/model"
	"time"

	"github.com/golang-jwt/jwt"
)

type (
	tokenService struct {
		secretKey []byte
		duration  time.Duration
		tokenType string
	}
)

func NewtokenService(secretKey []byte, duration time.Duration, tokenType string) *tokenService {
	return &tokenService{
		secretKey: secretKey,
		duration:  duration,
		tokenType: tokenType,
	}

}

func (a *tokenService) GenerateToken(userID model.UserID, isAdmin bool) (string, error) {
	// Генерируем случайные байты для уникальности токена
	randomBytes := make([]byte, 16)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}
	randomHex := hex.EncodeToString(randomBytes)

	claims := &model.Claims{
		UserID:    userID,
		IsAdmin:   isAdmin,
		TokenType: a.tokenType,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(a.duration).Unix(),
			Id:        randomHex, // Добавляем случайный ID для уникальности
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(a.secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (a *tokenService) ValidateToken(tokenString string) (*model.Claims, error) {

	token, err := jwt.ParseWithClaims(tokenString, &model.Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return a.secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*model.Claims); ok && token.Valid && claims.TokenType == a.tokenType {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}
