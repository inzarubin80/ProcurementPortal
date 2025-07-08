package http

import (
	"context"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
	"strconv"
)

// DeleteExercise godoc
// @Summary      Удалить упражнение
// @Description  Удаляет упражнение по ID
// @Tags         exercises
// @Accept       json
// @Produce      json
// @Param        id path string true "ID упражнения"
// @Success      200      {object}  uhttp.SuccessResponse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /exercises/{id} [delete]

type (
	DeleteExerciseService interface {
		DeleteExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
	}

	DeleteExerciseHandler struct {
		name    string
		service DeleteExerciseService
	}
)

func NewDeleteExerciseHandler(service DeleteExerciseService, name string) *DeleteExerciseHandler {
	return &DeleteExerciseHandler{
		name:    name,
		service: service,
	}
}

func (h *DeleteExerciseHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(int64)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	// Получаем id из URL
	exerciseIDStr := r.URL.Query().Get("id")
	if exerciseIDStr == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "id is required")
		return
	}

	exerciseID, err := strconv.ParseInt(exerciseIDStr, 10, 64)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid id")
		return
	}

	err = h.service.DeleteExercise(ctx, model.UserID(userID), exerciseID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, []byte("{}"))
}
