package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"

	"github.com/gorilla/sessions"
)

// RefreshToken godoc
// @Summary      Обновить токен
// @Description  Обновляет access и refresh токены
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        refresh_token body string true "Refresh токен"
// @Success      200      {object}  model.AuthData
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /refresh_token [post]

type (
	serviceRefreshToken interface {
		RefreshToken(ctx context.Context, refreshToken string) (*model.AuthData, error)
	}

	RefreshTokenHandler struct {
		name    string
		service serviceRefreshToken
		store   *sessions.CookieStore
	}
)

func NewRefreshTokenHandler(service serviceRefreshToken, name string, store *sessions.CookieStore) *RefreshTokenHandler {
	return &RefreshTokenHandler{
		name:    name,
		service: service,
		store:   store,
	}
}

func (h *RefreshTokenHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	session, err := h.store.Get(r, defenitions.SessionAuthenticationName)
	if err != nil {
		http.Error(w, "Unauthorized not session", http.StatusUnauthorized)
		return
	}

	tokenString, ok := session.Values[defenitions.Token].(string)
	if !ok {
		http.Error(w, "Unauthorized not Token", http.StatusUnauthorized)
		return
	}

	authData, err := h.service.RefreshToken(ctx, tokenString)
	if err != nil {
		http.Error(w, "Unauthorized not session", http.StatusUnauthorized)
		return
	}

	session.Values[defenitions.Token] = string(authData.RefreshToken)
	err = session.Save(r, w)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	jsonResponseLoginData, err := json.Marshal(authData)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	uhttp.SendSuccessfulResponse(w, jsonResponseLoginData)

}
