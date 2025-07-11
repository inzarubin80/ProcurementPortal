package authinterface

import (
	"context"
	"inzarubin80/MemCode/internal/model"

	"golang.org/x/oauth2"
)

type (
	TokenService interface {
		GenerateToken(userID model.UserID, isAdmin bool) (string, error)
		ValidateToken(tokenString string) (*model.Claims, error)
	}

	ProviderUserData interface {
		GetUserData(ctx context.Context, authorizationCode string) (*model.UserProfileFromProvider, error)
	}

	ProvidersUserData map[string]ProviderUserData

	ProviderOauthConf struct {
		Oauth2Config *oauth2.Config
		UrlUserData  string
		IconSVG      string
	}

	MapProviderOauthConf map[string]*ProviderOauthConf

	ProviderOauthConfFrontend struct {
		Provider    string
		ClientId    string
		AuthURL     string
		RedirectUri string
		IconSVG     string
		Scopes      []string
	}
)
