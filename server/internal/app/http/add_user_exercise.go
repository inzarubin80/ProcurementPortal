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

// AddUserExercise godoc
// @Summary      Добавить упражнение пользователю
// @Description  Добавляет упражнение в список пользователя
// @Tags         user_exercises
// @Accept       json
// @Produce      json
// @Param        exercise_id body string true "ID упражнения"
// @Success      200      {object}  uhttp.SuccessResponse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /user_exercises [post]

type (
	AddUserExerciseService interface {
		AddUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
	}

	AddUserExerciseHandler struct {
		name    string
		service AddUserExerciseService
	}
)

func NewAddUserExerciseHandler(service AddUserExerciseService, name string) *AddUserExerciseHandler {
	return &AddUserExerciseHandler{
		name:    name,
		service: service,
	}
}

func (h *AddUserExerciseHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	// Получаем exercise_id из query параметров
	exerciseIDStr := r.URL.Query().Get("exercise_id")
	if exerciseIDStr == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "exercise_id is required")
		return
	}

	exerciseID, err := strconv.ParseInt(exerciseIDStr, 10, 64)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid exercise_id")
		return
	}

	err = h.service.AddUserExercise(ctx, userID, exerciseID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]string{"message": "Exercise added successfully"}
	jsonData, err := json.Marshal(response)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
