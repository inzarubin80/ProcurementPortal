package http

import (
	"context"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"io"
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

	userID, ok := ctx.Value(defenitions.UserID).(int64)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	err = h.service.SetUserName(ctx, model.UserID(userID), string(body))
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
	}

	uhttp.SendSuccessfulResponse(w, []byte("{}"))

}
