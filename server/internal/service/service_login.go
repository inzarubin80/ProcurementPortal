package service

import (
	"context"
	"errors"
	"fmt"
	"inzarubin80/MemCode/internal/model"
	"time"
)

func (s *PokerService) Login(ctx context.Context, providerKey string, authorizationCode string) (*model.AuthData, error) {

	provider, ok := s.providersUserData[providerKey]

	if !ok {
		return nil, fmt.Errorf("provider not found")
	}

	userProfileFromProvider, err := provider.GetUserData(ctx, authorizationCode)
	if err != nil {
		return nil, err
	}

	userAuthProviders, err := s.repository.GetUserAuthProvidersByProviderUid(ctx, userProfileFromProvider.ProviderID, userProfileFromProvider.ProviderName)

	if err != nil && !errors.Is(err, model.ErrorNotFound) {
		return nil, err
	}

	if userAuthProviders == nil {

		user, err := s.repository.CreateUser(ctx, userProfileFromProvider)
		if err != nil {
			return nil, err
		}

		userAuthProviders, err = s.repository.AddUserAuthProviders(ctx, userProfileFromProvider, user.ID)
		if err != nil {
			return nil, err
		}

	}

	userID := userAuthProviders.UserID

	user, err := s.repository.GetUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.refreshTokenService.GenerateToken(userID, user.IsAdmin)
	if err != nil {
		return nil, err
	}

	refreshTokenModel := &model.RefreshToken{
		UserID:    userID,
		Token:     refreshToken,
		IssuedAt:  time.Now().UTC(),
		ExpiresAt: time.Now().UTC().Add(30 * 24 * time.Hour), // например, 30 дней
		Revoked:   false,
		UserAgent: "", // можно получить из ctx или http.Request
		IPAddress: "", // можно получить из ctx или http.Request
	}
	err = s.CreateRefreshToken(ctx, refreshTokenModel)
	if err != nil {
		return nil, err
	}

	accessToken, err := s.accessTokenService.GenerateToken(userID, user.IsAdmin)
	if err != nil {
		return nil, err
	}
	
	return &model.AuthData{
		User:       *user,
		RefreshToken: refreshToken,
		AccessToken:  accessToken,
	}, nil

}
