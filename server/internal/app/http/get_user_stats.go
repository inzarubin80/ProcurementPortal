package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

// GetUserStats godoc
// @Summary      Получить статистику пользователя
// @Description  Возвращает агрегированную статистику пользователя
// @Tags         user_stats
// @Accept       json
// @Produce      json
// @Success      200      {object}  model.UserStats
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /user_stats [get]

type GetUserStatsService interface {
	GetUserStats(ctx context.Context, userID model.UserID) (*model.UserStats, error)
}

type GetUserStatsHandler struct {
	service GetUserStatsService
}

func NewGetUserStatsHandler(service GetUserStatsService) *GetUserStatsHandler {
	return &GetUserStatsHandler{service: service}
}

func (h *GetUserStatsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}
	stats, err := h.service.GetUserStats(ctx, userID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	jsonData, err := json.Marshal(stats)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	uhttp.SendSuccessfulResponse(w, jsonData)
}
