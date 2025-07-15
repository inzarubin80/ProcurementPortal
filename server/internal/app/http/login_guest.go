package http

import (
	"context"
	"encoding/json"
	"fmt"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
)

// GuestLogin godoc
// @Summary      Анонимный вход (гость)
// @Description  Создаёт гостевого пользователя и возвращает токены
// @Tags         auth
// @Accept       json
// @Produce      json
// @Success      200      {object}  model.AuthData
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /guest_login [post]

type (
	// serviceGuestLogin должен совпадать с методами PokerService для guest login
	serviceGuestLogin interface {
		CreateGuestUser(ctx context.Context, name string) (*model.User, error)
		GenerateTokens(ctx context.Context, user *model.User) (*model.AuthData, error)
	}
	GuestLoginHandler struct {
		name    string
		service serviceGuestLogin
		store   *sessions.CookieStore
	}
)

func NewGuestLoginHandler(service serviceGuestLogin, name string, store *sessions.CookieStore) *GuestLoginHandler {
	return &GuestLoginHandler{
		name:    name,
		service: service,
		store:   store,
	}
}

func (h *GuestLoginHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Можно добавить уникальность имени гостя (например, с таймстампом)
	guestName := fmt.Sprintf("Гость_%d", time.Now().UnixNano())

	user, err := h.service.CreateGuestUser(ctx, guestName)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	authData, err := h.service.GenerateTokens(ctx, user)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	session, _ := h.store.Get(r, defenitions.SessionAuthenticationName)
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
	session.Values[defenitions.Token] = string(authData.RefreshToken)
	err = session.Save(r, w)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonResponse, err := json.Marshal(authData)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	uhttp.SendSuccessfulResponse(w, jsonResponse)
}
