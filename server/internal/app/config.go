package app

import (
	"encoding/base64"
	"fmt"
	"os"

	authinterface "inzarubin80/MemCode/internal/app/authinterface"

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

	imageDataYandexAuth, err := os.ReadFile("images/yandex-auth.png")
	if err != nil {
		fmt.Errorf(err.Error())
	}

	imageBase64 := base64.StdEncoding.EncodeToString(imageDataYandexAuth)

	provaders := make(authinterface.MapProviderOauthConf)
	provaders["yandex"] = &authinterface.ProviderOauthConf{
		Oauth2Config: &oauth2.Config{
			ClientID:     os.Getenv("CLIENT_ID_YANDEX"),
			ClientSecret: os.Getenv("CLIENT_SECRET_YANDEX"),
			RedirectURL:  os.Getenv("APP_ROOT") + "/YandexAuthCallback",
			Scopes:       []string{"login:email", "login:info"},
			Endpoint:     yandex.Endpoint,
		},
		UrlUserData: "https://login.yandex.ru/info?format=json",
		ImageBase64: imageBase64,
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
