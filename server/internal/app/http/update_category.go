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

// UpdateCategory godoc
// @Summary      Обновить категорию
// @Description  Обновляет существующую категорию по ID
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id path string true "ID категории"
// @Param        category body model.Category true "Данные категории"
// @Success      200      {object}  model.Category
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /categories/{id} [put]

type (
	UpdateCategoryService interface {
		UpdateCategory(ctx context.Context, userID model.UserID, categoryID int64, category *model.Category) (*model.Category, error)
	}

	UpdateCategoryHandler struct {
		name    string
		service UpdateCategoryService
	}
)

func NewUpdateCategoryHandler(service UpdateCategoryService, name string) *UpdateCategoryHandler {
	return &UpdateCategoryHandler{
		name:    name,
		service: service,
	}
}

func (h *UpdateCategoryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(int64)
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

	categoryID, err := strconv.ParseInt(categoryIDStr, 10, 64)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid category_id")
		return
	}

	var category model.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Устанавливаем ID из URL
	category.ID = categoryID
	category.UserID = model.UserID(userID)

	// Валидация поддерживаемого языка программирования
	if category.ProgrammingLanguage != "" && !model.IsSupportedLanguage(category.ProgrammingLanguage) {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "unsupported programming language")
		return
	}

	updatedCategory, err := h.service.UpdateCategory(ctx, model.UserID(userID), categoryID, &category)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, err := json.Marshal(updatedCategory)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
