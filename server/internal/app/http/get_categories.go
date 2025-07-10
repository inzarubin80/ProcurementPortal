package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

// GetCategories godoc
// @Summary      Получить категории
// @Description  Возвращает список категорий пользователя
// @Tags         categories
// @Accept       json
// @Produce      json
// @Success      200      {object}  model.CategoryListResponse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /categories [get]

type (
	GetCategoriesService interface {
		GetCategories(ctx context.Context, userID model.UserID) (model.CategoryListResponse, error)
	}

	GetCategoriesHandler struct {
		name    string
		service GetCategoriesService
	}
)

func NewGetCategoriesHandler(service GetCategoriesService, name string) *GetCategoriesHandler {
	return &GetCategoriesHandler{
		name:    name,
		service: service,
	}
}

func (h *GetCategoriesHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	categories, err := h.service.GetCategories(ctx, userID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, err := json.Marshal(categories)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
