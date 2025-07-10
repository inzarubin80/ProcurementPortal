package app

import (
	"os"

	authinterface "inzarubin80/MemCode/internal/app/authinterface"
	"inzarubin80/MemCode/internal/app/icons"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/yandex"
)

type (
	Options struct {
		Addr string
	}
	path struct {
		index, login, session, refreshToken, logOut, getProviders,
		ping, setUserName, getUser string

		// Exercise routes
		getExercises, createExercise, getExercise, updateExercise, deleteExercise string

		// Category routes
		getCategories, createCategory, getCategory, updateCategory, deleteCategory string

		// Languages route
		getLanguages string

		// Exercise stat route
		updateExerciseStat, getExerciseStat, getUserStats string

		// User Exercises route
		getUserExercises, addUserExercise, removeUserExercise string
		getAllUsers, setUserAdmin                             string
	}

	sectrets struct {
		storeSecret        string
		accessTokenSecret  string
		refreshTokenSecret string
	}

	config struct {
		addr          string
		path          path
		sectrets      sectrets
		provadersConf authinterface.MapProviderOauthConf
	}
)

func NewConfig(opts Options) config {

	provaders := make(authinterface.MapProviderOauthConf)
	provaders["yandex"] = &authinterface.ProviderOauthConf{
		Oauth2Config: &oauth2.Config{
			ClientID:     os.Getenv("CLIENT_ID_YANDEX"),
			ClientSecret: os.Getenv("CLIENT_SECRET_YANDEX"),
			RedirectURL:  os.Getenv("APP_ROOT") + "/auth/callback?provider=yandex",
			Scopes:       []string{"login:email", "login:info"},
			Endpoint:     yandex.Endpoint,
		},
		UrlUserData: "https://login.yandex.ru/info?format=json",
		IconSVG:     icons.GetProviderIcon("yandex"),
	}

	// Добавим Google провайдер для демонстрации
	provaders["google"] = &authinterface.ProviderOauthConf{
		Oauth2Config: &oauth2.Config{
			ClientID:     os.Getenv("CLIENT_ID_GOOGLE"),
			ClientSecret: os.Getenv("CLIENT_SECRET_GOOGLE"),
			RedirectURL:  os.Getenv("APP_ROOT") + "/auth/callback",
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint: oauth2.Endpoint{
				AuthURL:  "https://accounts.google.com/o/oauth2/auth",
				TokenURL: "https://oauth2.googleapis.com/token",
			},
		},
		UrlUserData: "https://www.googleapis.com/oauth2/v2/userinfo",
		IconSVG:     icons.GetProviderIcon("google"),
	}

	// Добавим GitHub провайдер для демонстрации
	provaders["github"] = &authinterface.ProviderOauthConf{
		Oauth2Config: &oauth2.Config{
			ClientID:     os.Getenv("CLIENT_ID_GITHUB"),
			ClientSecret: os.Getenv("CLIENT_SECRET_GITHUB"),
			RedirectURL:  os.Getenv("APP_ROOT") + "/auth/callback",
			Scopes:       []string{"user:email"},
			Endpoint: oauth2.Endpoint{
				AuthURL:  "https://github.com/login/oauth/authorize",
				TokenURL: "https://github.com/login/oauth/access_token",
			},
		},
		UrlUserData: "https://api.github.com/user",
		IconSVG:     icons.GetProviderIcon("github"),
	}

	config := config{
		addr: opts.Addr,
		path: path{
			index:        "",
			ping:         "GET /api/ping",
			getProviders: "GET /api/providers",
			login:        "POST	/api/user/login",
			setUserName:  "POST	/api/user/name",
			getUser:      "GET	/api/user",
			refreshToken: "POST	/api/user/refresh",
			session:      "GET		/api/user/session",
			logOut:       "GET		/api/user/logout",

			// Exercise routes
			getExercises:   "GET    /api/exercises",
			createExercise: "POST   /api/exercises/create",
			getExercise:    "GET    /api/exercises/get",
			updateExercise: "PUT    /api/exercises/update",
			deleteExercise: "DELETE /api/exercises/delete",

			// Category routes
			getCategories:  "GET    /api/categories",
			createCategory: "POST   /api/categories/create",
			getCategory:    "GET    /api/categories/get",
			updateCategory: "PUT    /api/categories/update",
			deleteCategory: "DELETE /api/categories/delete",

			// Languages route
			getLanguages: "GET    /api/languages",

			// Exercise stat route
			updateExerciseStat: "POST   /api/exercise_stat/update",
			getExerciseStat:    "GET 	/api/exercise_stat",
			getUserStats:       "GET    /api/user/stats",

			// User Exercises route
			getUserExercises:   "GET    /api/user/exercises",
			addUserExercise:    "POST   /api/user/exercises/add",
			removeUserExercise: "DELETE /api/user/exercises/remove",
			getAllUsers:        "GET    /api/users",
			setUserAdmin:       "POST   /api/users/set-admin",
		},

		sectrets: sectrets{
			storeSecret:        os.Getenv("STORE_SECRET"),
			accessTokenSecret:  os.Getenv("ACCESS_TOKEN_SECRET"),
			refreshTokenSecret: os.Getenv("REFRESH_TOKEN_SECRET"),
		},

		provadersConf: provaders,
	}

	return config
}
