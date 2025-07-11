package http

import (
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"net/http"

	"github.com/gorilla/sessions"
)

// Logout godoc
// @Summary      Выход пользователя
// @Description  Завершает сессию пользователя
// @Tags         auth
// @Accept       json
// @Produce      json
// @Success      200      {object}  uhttp.SuccessResponse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /logout [post]

type (
	LogOutHandler struct {
		name  string
		store *sessions.CookieStore
	}
)

func NewLogOutHandlerHandler(service serviceLogin, name string, store *sessions.CookieStore) *LogOutHandler {
	return &LogOutHandler{
		name:  name,
		store: store,
	}
}

func (h *LogOutHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	session, err := h.store.Get(r, defenitions.SessionAuthenticationName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	for k := range session.Values {
		delete(session.Values, k)
	}

	uhttp.SendSuccessfulResponse(w, []byte("{}"))

}
