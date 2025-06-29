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
	GetCategoryService interface {
		GetCategory(ctx context.Context, userID model.UserID, categoryID model.CategoryID) (*model.Category, error)
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

	category, err := h.service.GetCategory(ctx, userID, model.CategoryID(categoryID))
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
