package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type (
	UpdateExerciseService interface {
		UpdateExercise(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID, exercise *model.Exercise) (*model.Exercise, error)
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

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	// Получаем exercise_id из URL
	exerciseIDStr := r.URL.Query().Get("exercise_id")
	if exerciseIDStr == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "exercise_id is required")
		return
	}

	// Парсим UUID
	parsedUUID, err := uuid.Parse(exerciseIDStr)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid exercise_id")
		return
	}

	exerciseID := pgtype.UUID{
		Bytes: parsedUUID,
		Valid: true,
	}

	var exercise model.Exercise
	if err := json.NewDecoder(r.Body).Decode(&exercise); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Устанавливаем ID из URL
	exercise.ID = model.ExerciseID(exerciseID)
	exercise.UserID = userID

	// Валидация поддерживаемого языка программирования
	if exercise.ProgrammingLanguage != "" && !model.IsSupportedLanguage(exercise.ProgrammingLanguage) {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "unsupported programming language")
		return
	}

	updatedExercise, err := h.service.UpdateExercise(ctx, userID, model.ExerciseID(exerciseID), &exercise)
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
