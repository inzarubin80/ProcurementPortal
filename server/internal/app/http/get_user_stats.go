package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

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
	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
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
