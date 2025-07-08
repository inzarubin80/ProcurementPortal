package http

import (
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
	"strconv"
)

// GetExerciseStat godoc
// @Summary      Получить статистику по упражнению
// @Description  Возвращает статистику пользователя по конкретному упражнению
// @Tags         exercise_stats
// @Accept       json
// @Produce      json
// @Param        id path string true "ID упражнения"
// @Success      200      {object}  model.ExerciseStat
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /exercise_stat/{id} [get]

type GetExerciseStatService interface {
	GetExerciseStat(userID model.UserID, exerciseID int64) (*model.ExerciseStat, error)
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

	exID, err := strconv.ParseInt(exIDStr, 10, 64)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid exercise_id")
		return
	}

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
		stat = &model.ExerciseStat{
			UserID:             userID,
			ExerciseID:         exID,
			TotalAttempts:      0,
			SuccessfulAttempts: 0,
			TotalTypingTime:    0,
			TotalTypedChars:    0,
		}
	}
	jsonData, _ := json.Marshal(stat)
	uhttp.SendSuccessfulResponse(w, jsonData)
}
