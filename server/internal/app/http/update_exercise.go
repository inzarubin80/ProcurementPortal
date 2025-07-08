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

// UpdateExercise godoc
// @Summary      Обновить упражнение
// @Description  Обновляет существующее упражнение по ID
// @Tags         exercises
// @Accept       json
// @Produce      json
// @Param        id path string true "ID упражнения"
// @Param        exercise body model.Exercise true "Данные упражнения"
// @Success      200      {object}  model.Exercise
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /exercises/{id} [put]

type (
	UpdateExerciseService interface {
		UpdateExercise(ctx context.Context, userID model.UserID, exerciseID int64, exercise *model.Exercise) (*model.Exercise, error)
	}

	UpdateExerciseHandler struct {
		name    string
		service UpdateExerciseService
	}
)

func NewUpdateExerciseHandler(service UpdateExerciseService, name string) *UpdateExerciseHandler {
	return &UpdateExerciseHandler{
		name:    name,
		service: service,
	}
}

func (h *UpdateExerciseHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
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

	var exercise model.Exercise
	if err := json.NewDecoder(r.Body).Decode(&exercise); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Устанавливаем ID из URL
	exercise.ID = exerciseID
	exercise.UserID = model.UserID(userID)

	// Валидация поддерживаемого языка программирования
	if exercise.ProgrammingLanguage != "" && !model.IsSupportedLanguage(exercise.ProgrammingLanguage) {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "unsupported programming language")
		return
	}

	updatedExercise, err := h.service.UpdateExercise(ctx, model.UserID(userID), exerciseID, &exercise)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, err := json.Marshal(updatedExercise)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
