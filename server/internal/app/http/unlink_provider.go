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
	UnlinkProviderService interface {
		UnlinkProviderFromUser(ctx context.Context, userID model.UserID, provider string) error
		GetUserAuthProvidersByUserID(ctx context.Context, userID model.UserID) ([]*model.UserAuthProviders, error)
	}

	UnlinkProviderHandler struct {
		service UnlinkProviderService
	}
)

func NewUnlinkProviderHandler(service UnlinkProviderService) *UnlinkProviderHandler {
	return &UnlinkProviderHandler{service: service}
}

func (h *UnlinkProviderHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusUnauthorized, "not user ID")
		return
	}

	var req struct {
		Provider string `json:"provider"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Provider == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "provider required")
		return
	}

	// Проверяем, что останется хотя бы один провайдер
	linked, err := h.service.GetUserAuthProvidersByUserID(ctx, userID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}
	if len(linked) <= 1 {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "Нельзя отвязать последний провайдер")
		return
	}

	err = h.service.UnlinkProviderFromUser(ctx, userID, req.Provider)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, []byte(`{"result":"ok"}`))
}
