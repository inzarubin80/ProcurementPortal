package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"io"
	"net/http"

	"github.com/gorilla/sessions"
)

// Login godoc
// @Summary      Вход пользователя
// @Description  Аутентификация пользователя через провайдера
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        login body model.AuthData true "Данные для входа"
// @Success      200      {object}  model.AuthData
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /login [post]

type (
	serviceLogin interface {
		Login(ctx context.Context, providerKey string, authorizationCode string) (*model.AuthData, error)
	}
	LoginHandler struct {
		name    string
		service serviceLogin
		store   *sessions.CookieStore
	}

	ResponseLoginData struct {
		Token  string
		UserID model.UserID
	}

	RequestLoginData struct {
		AuthorizationCode string
		ProviderKey       string
	}
)

func NewLoginHandler(service serviceLogin, name string, store *sessions.CookieStore) *LoginHandler {
	return &LoginHandler{
		name:    name,
		service: service,
		store:   store,
	}
}

func (h *LoginHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	body, err := io.ReadAll(r.Body)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	var loginData *RequestLoginData
	err = json.Unmarshal(body, &loginData)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, err.Error())
		return
	}

	authData, err := h.service.Login(ctx, loginData.ProviderKey, loginData.AuthorizationCode)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	session, _ := h.store.Get(r, defenitions.SessionAuthenticationName)

	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,             // Время жизни сессии (7 дней)
		HttpOnly: true,                  // Запретить доступ через JavaScript
		Secure:   true,                  // Требует HTTPS
		SameSite: http.SameSiteNoneMode, // Разрешить cross-origin
	}

	session.Values[defenitions.Token] = string(authData.RefreshToken)
	err = session.Save(r, w)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	responseLoginData := &ResponseLoginData{
		Token:  authData.AccessToken,
		UserID: authData.UserID,
	}

	jsonResponseLoginData, err := json.Marshal(responseLoginData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	uhttp.SendSuccessfulResponse(w, jsonResponseLoginData)

}
