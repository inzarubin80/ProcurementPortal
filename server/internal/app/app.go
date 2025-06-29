package app

import (
	"context"
	"fmt"
	authinterface "inzarubin80/MemCode/internal/app/authinterface"
	providerUserData "inzarubin80/MemCode/internal/app/clients/provider_user_data"
	appHttp "inzarubin80/MemCode/internal/app/http"
	middleware "inzarubin80/MemCode/internal/app/http/middleware"
	tokenservice "inzarubin80/MemCode/internal/app/token_service"
	"inzarubin80/MemCode/internal/model"
	repository "inzarubin80/MemCode/internal/repository"
	service "inzarubin80/MemCode/internal/service"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/cors"
	"golang.org/x/oauth2"
)

const (
	readHeaderTimeoutSeconds = 3
)

type (
	mux interface {
		Handle(pattern string, handler http.Handler)
	}
	server interface {
		ListenAndServe() error
		Close() error
	}

	MemCodeService interface {
		GetUser(ctx context.Context, userID model.UserID) (*model.User, error)
		Login(ctx context.Context, providerKey string, authorizationCode string) (*model.AuthData, error)
		Authorization(context.Context, string) (*model.Claims, error)
		RefreshToken(ctx context.Context, refreshToken string) (*model.AuthData, error)
		SetUserName(ctx context.Context, userID model.UserID, name string) error
	}

	TokenService interface {
		GenerateToken(userID model.UserID) (string, error)
		ValidateToken(tokenString string) (*model.Claims, error)
	}

	App struct {
		mux                        mux
		server                     server
		pokerService               MemCodeService
		config                     config
		oauthConfig                *oauth2.Config
		store                      *sessions.CookieStore
		providersOauthConfFrontend []authinterface.ProviderOauthConfFrontend
	}
)

func (a *App) ListenAndServe() error {
	handlers := map[string]http.Handler{
		a.config.path.getUser:     appHttp.NewGetUserHandler(a.store, a.config.path.getUser, a.pokerService),
		a.config.path.ping:        appHttp.NewPingHandlerHandler(a.config.path.ping),
		a.config.path.setUserName: appHttp.NewSetUserNameHandler(a.pokerService, a.config.path.setUserName),
	}

	for path, handler := range handlers {
		a.mux.Handle(path, middleware.NewAuthMiddleware(handler, a.store, a.pokerService))
	}

	a.mux.Handle(a.config.path.login, appHttp.NewLoginHandler(a.pokerService, a.config.path.login, a.store))
	a.mux.Handle(a.config.path.session, appHttp.NewGetSessionHandler(a.store, a.config.path.session))
	a.mux.Handle(a.config.path.refreshToken, appHttp.NewRefreshTokenHandler(a.pokerService, a.config.path.refreshToken, a.store))
	a.mux.Handle(a.config.path.getProviders, appHttp.NewProvadersHandler(a.providersOauthConfFrontend, a.config.path.refreshToken))

	fmt.Println("start server")
	return a.server.ListenAndServe()
}

func NewApp(ctx context.Context, config config, dbConn *pgxpool.Pool) (*App, error) {

	var (
		mux             = http.NewServeMux()
		pokerRepository = repository.NewPokerRepository(100, dbConn)
		store           = sessions.NewCookieStore([]byte(config.sectrets.storeSecret))
	)

	accessTokenService := tokenservice.NewtokenService([]byte(config.sectrets.accessTokenSecret), 2*time.Hour, model.Access_Token_Type)
	refreshTokenService := tokenservice.NewtokenService([]byte(config.sectrets.refreshTokenSecret), 24*time.Hour, model.Refresh_Token_Type)

	providerOauthConfFrontend := []authinterface.ProviderOauthConfFrontend{}
	providers := make(authinterface.ProvidersUserData)
	for key, value := range config.provadersConf {

		providers[key] = providerUserData.NewProviderUserData(value.UrlUserData, value.Oauth2Config, key)

		providerOauthConfFrontend = append(providerOauthConfFrontend,
			authinterface.ProviderOauthConfFrontend{
				Provider:    key,
				ClientId:    value.Oauth2Config.ClientID,
				RedirectUri: value.Oauth2Config.RedirectURL,
				AuthURL:     value.Oauth2Config.Endpoint.AuthURL,
				ImageBase64: value.ImageBase64,
			},
		)
	}

	pokerService := service.NewPokerService(pokerRepository, accessTokenService, refreshTokenService, providers)

	// Создаем CORS middleware
	corsMiddleware := cors.New(cors.Options{
		// Явно разрешаем оба домена (без точки в начале)
		AllowedOrigins: []string{
			"https://codekata.ru",
			"https://api.codekata.ru",
			"http://localhost:3000",
		},
		// Добавляем все необходимые методы
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		// Разрешаем все стандартные заголовки + кастомные
		AllowedHeaders: []string{
			"Origin", "Content-Type", "Accept", "Authorization",
			"X-Requested-With", "X-CSRF-Token", "Custom-Header",
		},
		// Разрешаем куки и авторизацию
		AllowCredentials: true,
		// Опционально: максимальное время кеширования preflight-запросов
		MaxAge: 86400,
	})

	// Обертываем основной обработчик
	handler := corsMiddleware.Handler(middleware.NewLogMux(mux))

	return &App{
		mux:                        mux,
		server:                     &http.Server{Addr: config.addr, Handler: handler, ReadHeaderTimeout: readHeaderTimeoutSeconds * time.Second},
		pokerService:               pokerService,
		config:                     config,
		store:                      store,
		providersOauthConfFrontend: providerOauthConfFrontend,
	}, nil

}
