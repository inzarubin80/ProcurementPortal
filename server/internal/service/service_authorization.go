package service

import (
	"context"
	"fmt"
	"inzarubin80/MemCode/internal/model"
)

func (s *PokerService) Authorization(ctx context.Context, token string) (*model.Claims, error) {
	// Пробуем access token
	claims, err := s.accessTokenService.ValidateToken(token)
	if err == nil && claims != nil {
		return claims, nil
	}
	// Пробуем refresh token
	claims, err = s.refreshTokenService.ValidateToken(token)
	if err == nil && claims != nil {
		return claims, nil
	}
	// Если оба невалидны — ошибка
	return nil, fmt.Errorf("invalid token")
}
