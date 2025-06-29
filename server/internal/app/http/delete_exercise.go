package http

import (
	"context"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type (
	DeleteExerciseService interface {
		DeleteExercise(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID) error
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

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
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

	// Парсим UUID
	parsedUUID, err := uuid.Parse(exerciseIDStr)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid id")
		return
	}

	exerciseID := pgtype.UUID{
		Bytes: parsedUUID,
		Valid: true,
	}

	err = h.service.DeleteExercise(ctx, userID, model.ExerciseID(exerciseID))
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, []byte("{}"))
}
