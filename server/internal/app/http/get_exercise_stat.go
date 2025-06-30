package http

import (
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type GetExerciseStatService interface {
	GetExerciseStat(userID model.UserID, exerciseID model.ExerciseID) (*model.ExerciseStat, error)
}

type GetExerciseStatHandler struct {
	service GetExerciseStatService
}

func NewGetExerciseStatHandler(service GetExerciseStatService) *GetExerciseStatHandler {
	return &GetExerciseStatHandler{service: service}
}

func (h *GetExerciseStatHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusUnauthorized, "user not found")
		return
	}

	exIDStr := r.URL.Query().Get("exercise_id")
	if exIDStr == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "exercise_id required")
		return
	}
	var exID model.ExerciseID
	uuidVal := pgtype.UUID{}
	if err := uuidVal.Scan(exIDStr); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid exercise_id")
		return
	}
	exID = model.ExerciseID(uuidVal)

	stat, err := h.service.GetExerciseStat(userID, exID)
	if err != nil {
		if err.Error() == "no rows in result set" {
			uhttp.SendErrorResponse(w, http.StatusNotFound, "not found")
			return
		}
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	if stat == nil {
		uuidStr := ""
		if uuidVal, ok := any(exID).(pgtype.UUID); ok {
			uuidStr = uuidVal.String()
		}
		stat = &model.ExerciseStat{
			UserID:             userID,
			ExerciseID:         uuidStr,
			TotalAttempts:      0,
			SuccessfulAttempts: 0,
			TotalTypingTime:    0,
			TotalTypedChars:    0,
		}
	}
	jsonData, _ := json.Marshal(stat)
	uhttp.SendSuccessfulResponse(w, jsonData)
}
