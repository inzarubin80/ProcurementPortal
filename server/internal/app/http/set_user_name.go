package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

// SetUserName godoc
// @Summary      Установить имя пользователя
// @Description  Устанавливает новое имя пользователя
// @Tags         user
// @Accept       json
// @Produce      json
// @Param        name body string true "Новое имя"
// @Success      200      {object}  uhttp.SuccessResponse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /user/name [post]

type (
	serviceSetUserName interface {
		SetUserName(ctx context.Context, userID model.UserID, name string) error
	}
	SetUserNameHandler struct {
		name    string
		service serviceSetUserName
	}
)

func NewSetUserNameHandler(service serviceSetUserName, name string) *SetUserNameHandler {
	return &SetUserNameHandler{
		name:    name,
		service: service,
	}
}

func (h *SetUserNameHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var err error
	err = h.service.SetUserName(ctx, model.UserID(userID), req.Name)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	resp := map[string]string{"name": req.Name}
	jsonData, err := json.Marshal(resp)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	uhttp.SendSuccessfulResponse(w, jsonData)

}
