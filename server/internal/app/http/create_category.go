package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

// CreateCategory godoc
// @Summary      Создать категорию
// @Description  Создаёт новую категорию
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        category body model.Category true "Данные категории"
// @Success      200      {object}  model.Category
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /categories [post]

type (
	CreateCategoryService interface {
		CreateCategory(ctx context.Context, userID model.UserID, isAdmin bool, category *model.Category) (*model.Category, error)
	}

	CreateCategoryHandler struct {
		name    string
		service CreateCategoryService
	}
)

func NewCreateCategoryHandler(service CreateCategoryService, name string) *CreateCategoryHandler {
	return &CreateCategoryHandler{
		name:    name,
		service: service,
	}
}

func (h *CreateCategoryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	var category model.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Устанавливаем user_id из контекста
	category.UserID = userID

	// Устанавливаем значения по умолчанию
	if category.Status == "" {
		category.Status = model.CategoryStatusActive
	}

	// Валидация обязательных полей
	if category.Name == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "name is required")
		return
	}
	if category.ProgrammingLanguage == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "programming_language is required")
		return
	}

	// Валидация поддерживаемого языка программирования
	if !model.IsSupportedLanguage(category.ProgrammingLanguage) {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "unsupported programming language")
		return
	}

	isAdmin, _ := ctx.Value(defenitions.IsAdminKey).(bool)
	createdCategory, err := h.service.CreateCategory(ctx, userID, isAdmin, &category)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, err := json.Marshal(createdCategory)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
