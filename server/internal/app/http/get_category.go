package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
	"strconv"
)

// GetCategory godoc
// @Summary      Получить категорию
// @Description  Возвращает одну категорию по ID
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id path string true "ID категории"
// @Success      200      {object}  model.Category
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /categories/{id} [get]

type (
	GetCategoryService interface {
		GetCategory(ctx context.Context, userID model.UserID, categoryID int64) (*model.Category, error)
	}

	GetCategoryHandler struct {
		name    string
		service GetCategoryService
	}
)

func NewGetCategoryHandler(service GetCategoryService, name string) *GetCategoryHandler {
	return &GetCategoryHandler{
		name:    name,
		service: service,
	}
}

func (h *GetCategoryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	// Получаем ID категории из query параметра
	categoryIDStr := r.URL.Query().Get("category_id")
	if categoryIDStr == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "category_id is required")
		return
	}

	categoryID := 0

	if categoryIDStr != "" {
		if p, err := strconv.Atoi(categoryIDStr); err == nil && p > 0 {
			categoryID = p
		}
	}

	category, err := h.service.GetCategory(ctx, userID, int64(categoryID))
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, err := json.Marshal(category)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
