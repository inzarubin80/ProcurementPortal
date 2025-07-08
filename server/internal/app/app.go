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
	httpSwagger "github.com/swaggo/http-swagger"
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

		// Exercise methods
		CreateExercise(ctx context.Context, userID model.UserID, exercise *model.Exercise) (*model.Exercise, error)
		GetExercise(ctx context.Context, userID model.UserID, exerciseID int64) (*model.ExerciseDetailse, error)
		UpdateExercise(ctx context.Context, userID model.UserID, exerciseID int64, exercise *model.Exercise) (*model.Exercise, error)
		DeleteExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
		GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, page, pageSize int) (*model.ExerciseListWithUserResponse, error)
		UpsertExerciseStat(userID model.UserID, exerciseID int64, attempts int, successAttempts int) (*model.ExerciseStat, error)

		// Category methods
		CreateCategory(ctx context.Context, userID model.UserID, category *model.Category) (*model.Category, error)
		GetCategories(ctx context.Context, userID model.UserID, page, pageSize int) (model.CategoryListResponse, error)
		GetCategory(ctx context.Context, userID model.UserID, categoryID int64) (*model.Category, error)
		UpdateCategory(ctx context.Context, userID model.UserID, categoryID int64, category *model.Category) (*model.Category, error)
		DeleteCategory(ctx context.Context, userID model.UserID, categoryID int64) error

		// Добавлено для соответствия GetExerciseStatService
		GetExerciseStat(userID model.UserID, exerciseID int64) (*model.ExerciseStat, error)
		GetUserStats(ctx context.Context, userID model.UserID) (*model.UserStats, error)

		// User Exercises methods
		GetUserExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID int64, page int, pageSize int) (*model.ExerciseListWithUserResponse, error)
		AddUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
		RemoveUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
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

		// Exercise handlers
		a.config.path.getExercises:       appHttp.NewGetExercisesHandler(a.pokerService, "getExercises"),
		a.config.path.createExercise:     appHttp.NewCreateExerciseHandler(a.pokerService, "create_exercise"),
		a.config.path.getExercise:        appHttp.NewGetExerciseHandler(a.pokerService, "get_exercise"),
		a.config.path.updateExercise:     appHttp.NewUpdateExerciseHandler(a.pokerService, "update_exercise"),
		a.config.path.deleteExercise:     appHttp.NewDeleteExerciseHandler(a.pokerService, "delete_exercise"),
		a.config.path.updateExerciseStat: appHttp.NewUpdateExerciseStatHandler(a.pokerService),
		a.config.path.getExerciseStat:    appHttp.NewGetExerciseStatHandler(a.pokerService),

		// Category handlers
		a.config.path.getCategories:  appHttp.NewGetCategoriesHandler(a.pokerService, "get_categories"),
		a.config.path.createCategory: appHttp.NewCreateCategoryHandler(a.pokerService, "create_category"),
		a.config.path.getCategory:    appHttp.NewGetCategoryHandler(a.pokerService, "get_category"),
		a.config.path.updateCategory: appHttp.NewUpdateCategoryHandler(a.pokerService, "update_category"),
		a.config.path.deleteCategory: appHttp.NewDeleteCategoryHandler(a.pokerService, "delete_category"),

		// New handler for getUserStats
		a.config.path.getUserStats: appHttp.NewGetUserStatsHandler(a.pokerService),

		// User Exercises handler
		a.config.path.getUserExercises:   appHttp.NewGetUserExercisesHandler(a.pokerService, "get_user_exercises"),
		a.config.path.addUserExercise:    appHttp.NewAddUserExerciseHandler(a.pokerService, "add_user_exercise"),
		a.config.path.removeUserExercise: appHttp.NewRemoveUserExerciseHandler(a.pokerService, "remove_user_exercise"),
	}

	for path, handler := range handlers {
		a.mux.Handle(path, middleware.NewAuthMiddleware(handler, a.store, a.pokerService))
	}

	a.mux.Handle(a.config.path.login, appHttp.NewLoginHandler(a.pokerService, a.config.path.login, a.store))
	a.mux.Handle(a.config.path.refreshToken, appHttp.NewRefreshTokenHandler(a.pokerService, a.config.path.refreshToken, a.store))
	a.mux.Handle(a.config.path.getProviders, appHttp.NewProvadersHandler(a.providersOauthConfFrontend, a.config.path.refreshToken))

	// Languages handler (без авторизации)
	a.mux.Handle(a.config.path.getLanguages, appHttp.NewGetLanguagesHandler("get_languages"))

	fmt.Println("start server")
	return a.server.ListenAndServe()
}

func NewApp(ctx context.Context, config config, dbConn *pgxpool.Pool) (*App, error) {

	var (
		mux             = http.NewServeMux()
		pokerRepository = repository.NewPokerRepository(100, dbConn)
		store           = sessions.NewCookieStore([]byte(config.sectrets.storeSecret))
	)

	// Swagger UI
	mux.Handle("/swagger/", httpSwagger.WrapHandler)

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
				IconSVG:     value.IconSVG,
			},
		)
	}

	pokerService := service.NewPokerService(pokerRepository, accessTokenService, refreshTokenService, providers)

	// Создаем CORS middleware
	corsMiddleware := cors.New(cors.Options{
		// Разрешаем все необходимые домены
		AllowedOrigins: []string{
			"https://memo-code.ru",
			"https://api.memo-code.ru",
			"https://codekata.ru",
			"https://api.codekata.ru",
			"http://localhost:3000",
		},
		// Добавляем все необходимые методы
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"},
		// Разрешаем все стандартные заголовки + кастомные
		AllowedHeaders: []string{
			"Origin", "Content-Type", "Accept", "Authorization",
			"X-Requested-With", "X-CSRF-Token", "Custom-Header",
			"Cache-Control", "Pragma",
		},
		// Разрешаем куки и авторизацию
		AllowCredentials: true,
		// Опционально: максимальное время кеширования preflight-запросов
		MaxAge: 86400,
		// Добавляем отладочную информацию
		Debug: true,
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
