package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
	"strconv"
)

// GetExercise godoc
// @Summary      Получить упражнение
// @Description  Возвращает одно упражнение по ID
// @Tags         exercises
// @Accept       json
// @Produce      json
// @Param        id path string true "ID упражнения"
// @Success      200      {object}  model.ExerciseDetailse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /exercises/{id} [get]

type (
	GetExerciseService interface {
		GetExercise(ctx context.Context, userID model.UserID, exerciseID int64) (*model.ExerciseDetailse, error)
	}

	GetExerciseHandler struct {
		name    string
		service GetExerciseService
	}
)

func NewGetExerciseHandler(service GetExerciseService, name string) *GetExerciseHandler {
	return &GetExerciseHandler{
		name:    name,
		service: service,
	}
}

func (h *GetExerciseHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
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

	exerciseDetailse, err := h.service.GetExercise(ctx, model.UserID(userID), exerciseID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, err := json.Marshal(exerciseDetailse)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
