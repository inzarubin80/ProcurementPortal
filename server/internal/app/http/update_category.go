package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type (
	UpdateCategoryService interface {
		UpdateCategory(ctx context.Context, userID model.UserID, categoryID model.CategoryID, category *model.Category) (*model.Category, error)
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

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
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

	var categoryID pgtype.UUID
	if err := categoryID.Scan(categoryIDStr); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid category_id")
		return
	}

	var category model.Category
	if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Устанавливаем ID из URL
	category.ID = model.CategoryID(categoryID)
	category.UserID = userID

	// Валидация поддерживаемого языка программирования
	if category.ProgrammingLanguage != "" && !model.IsSupportedLanguage(category.ProgrammingLanguage) {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "unsupported programming language")
		return
	}

	updatedCategory, err := h.service.UpdateCategory(ctx, userID, model.CategoryID(categoryID), &category)
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
