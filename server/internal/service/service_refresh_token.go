package service

import (
	"context"
	"errors"
	"inzarubin80/MemCode/internal/model"
	"time"
)

func (s *PokerService) RefreshToken(ctx context.Context, refreshToken string) (*model.AuthData, error) {
	// 1. Проверяем refresh-токен в базе
	dbToken, err := s.GetRefreshTokenByToken(ctx, refreshToken)
	if err != nil || dbToken == nil || dbToken.Revoked || dbToken.ExpiresAt.Before(time.Now().UTC()) {
		return nil, errors.New("unauthorized")
	}

	claims, err := s.refreshTokenService.ValidateToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// 2. Отзываем старый refresh-токен
	err = s.RevokeRefreshToken(ctx, refreshToken)
	if err != nil {
		return nil, err
	}

	user, err := s.repository.GetUser(ctx, claims.UserID)
	if err != nil {
		return nil, err
	}

	// 3. Генерируем и сохраняем новый refresh-токен
	newRefreshToken, err := s.refreshTokenService.GenerateToken(claims.UserID, user.IsAdmin)
	if err != nil {
		return nil, err
	}
	refreshTokenModel := &model.RefreshToken{
		UserID:    claims.UserID,
		Token:     newRefreshToken,
		IssuedAt:  time.Now().UTC(),
		ExpiresAt: time.Now().UTC().Add(30 * 24 * time.Hour),
		Revoked:   false,
		UserAgent: "",
		IPAddress: "",
	}
	err = s.CreateRefreshToken(ctx, refreshTokenModel)
	if err != nil {
		return nil, err
	}

	newAccessToken, err := s.accessTokenService.GenerateToken(claims.UserID, user.IsAdmin)
	if err != nil {
		return nil, err
	}

	return &model.AuthData{
		UserID:       claims.UserID,
		RefreshToken: newRefreshToken,
		AccessToken:  newAccessToken,
	}, nil
}
