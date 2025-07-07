package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

type (
	RemoveUserExerciseService interface {
		RemoveUserExercise(ctx context.Context, userID model.UserID, exerciseID string) error
	}

	RemoveUserExerciseHandler struct {
		name    string
		service RemoveUserExerciseService
	}
)

func NewRemoveUserExerciseHandler(service RemoveUserExerciseService, name string) *RemoveUserExerciseHandler {
	return &RemoveUserExerciseHandler{
		name:    name,
		service: service,
	}
}

func (h *RemoveUserExerciseHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	exerciseID := r.URL.Query().Get("exercise_id")
	if exerciseID == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "exercise_id is required")
		return
	}

	err := h.service.RemoveUserExercise(ctx, userID, exerciseID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	response := map[string]string{"message": "Exercise removed from user list successfully"}
	jsonData, err := json.Marshal(response)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
