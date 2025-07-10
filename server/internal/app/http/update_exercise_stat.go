package http

import (
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

type UpdateExerciseStatService interface {
	UpsertExerciseStat(userID model.UserID, exerciseID int64, attempts int, successAttempts int) (*model.ExerciseStat, error)
}

type UpdateExerciseStatHandler struct {
	service UpdateExerciseStatService
}

func NewUpdateExerciseStatHandler(service UpdateExerciseStatService) *UpdateExerciseStatHandler {
	return &UpdateExerciseStatHandler{service: service}
}

type updateExerciseStatRequest struct {
	ExerciseID      int64  `json:"exercise_id"`
	Attempts        int    `json:"attempts"`
	SuccessAttempts int    `json:"success_attempts"`
}

func (h *UpdateExerciseStatHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusUnauthorized, "user not found")
		return
	}

	var req updateExerciseStatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}


	stat, err := h.service.UpsertExerciseStat(userID, req.ExerciseID, req.Attempts, req.SuccessAttempts)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, _ := json.Marshal(stat)
	uhttp.SendSuccessfulResponse(w, jsonData)
}
