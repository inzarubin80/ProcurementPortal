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

// GetUser godoc
// @Summary      Получить пользователя
// @Description  Возвращает информацию о текущем пользователе
// @Tags         user
// @Accept       json
// @Produce      json
// @Success      200      {object}  model.User
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /user [get]

type (
	GetUserService interface {
		GetUser(ctx context.Context, userID model.UserID) (*model.User, error)
	}

	GetAllUsersService interface {
		GetAllUsers(ctx context.Context) ([]*model.User, error)
	}

	SetUserAdminService interface {
		SetUserAdmin(ctx context.Context, userID model.UserID, isAdmin bool) (*model.User, error)
	}

	GetAllUsersHandler struct {
		name    string
		store   *sessions.CookieStore
		service GetAllUsersService
	}

	GetUserHandler struct {
		name    string
		store   *sessions.CookieStore
		service GetUserService
	}

	SetUserAdminHandler struct {
		name    string
		store   *sessions.CookieStore
		service SetUserAdminService
	}
)

func NewGetUserHandler(store *sessions.CookieStore, name string, service GetUserService) *GetUserHandler {
	return &GetUserHandler{
		name:    name,
		store:   store,
		service: service,
	}
}

func (h *GetUserHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
	}

	user, err := h.service.GetUser(ctx, model.UserID(userID))
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())

	}

	jsonData, err := json.Marshal(user)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)

}

func NewGetAllUsersHandler(store *sessions.CookieStore, name string, service GetAllUsersService) *GetAllUsersHandler {
	return &GetAllUsersHandler{
		name:    name,
		store:   store,
		service: service,
	}
}

// ServeHTTP для получения всех пользователей
func (h *GetAllUsersHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	users, err := h.service.GetAllUsers(ctx)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	jsonData, err := json.Marshal(users)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	uhttp.SendSuccessfulResponse(w, jsonData)
}

func NewSetUserAdminHandler(store *sessions.CookieStore, name string, service SetUserAdminService) *SetUserAdminHandler {
	return &SetUserAdminHandler{
		name:    name,
		store:   store,
		service: service,
	}
}

// ServeHTTP для назначения пользователя администратором
func (h *SetUserAdminHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	type reqBody struct {
		UserID  int64 `json:"user_id"`
		IsAdmin bool  `json:"is_admin"`
	}
	var body reqBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}
	user, err := h.service.SetUserAdmin(ctx, model.UserID(body.UserID), body.IsAdmin)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	jsonData, err := json.Marshal(user)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	uhttp.SendSuccessfulResponse(w, jsonData)
}
