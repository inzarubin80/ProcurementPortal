package http

import (
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type UpdateExerciseStatService interface {
	UpsertExerciseStat(userID model.UserID, exerciseID model.ExerciseID, isSuccess bool, typingTime int64, totalTypedChars int) (*model.ExerciseStat, error)
}

type UpdateExerciseStatHandler struct {
	service UpdateExerciseStatService
}

func NewUpdateExerciseStatHandler(service UpdateExerciseStatService) *UpdateExerciseStatHandler {
	return &UpdateExerciseStatHandler{service: service}
}

type updateExerciseStatRequest struct {
	ExerciseID      string `json:"exercise_id"`
	IsSuccess       bool   `json:"is_success"`
	TypingTime      int64  `json:"typing_time"`
	TotalTypedChars int    `json:"total_typed_chars"`
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

	var exID model.ExerciseID
	uuidVal := pgtype.UUID{}
	if err := uuidVal.Scan(req.ExerciseID); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid exercise_id")
		return
	}
	exID = model.ExerciseID(uuidVal)

	stat, err := h.service.UpsertExerciseStat(userID, exID, req.IsSuccess, req.TypingTime, req.TotalTypedChars)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, _ := json.Marshal(stat)
	uhttp.SendSuccessfulResponse(w, jsonData)
}
