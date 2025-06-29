package http

import (
	"context"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"

	"github.com/jackc/pgx/v5/pgtype"
)

type (
	DeleteCategoryService interface {
		DeleteCategory(ctx context.Context, userID model.UserID, categoryID model.CategoryID) error
	}

	DeleteCategoryHandler struct {
		name    string
		service DeleteCategoryService
	}
)

func NewDeleteCategoryHandler(service DeleteCategoryService, name string) *DeleteCategoryHandler {
	return &DeleteCategoryHandler{
		name:    name,
		service: service,
	}
}

func (h *DeleteCategoryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	// Получаем ID категории из query параметра
	categoryIDStr := r.URL.Query().Get("id")
	if categoryIDStr == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "id is required")
		return
	}

	var categoryID pgtype.UUID
	if err := categoryID.Scan(categoryIDStr); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid category_id")
		return
	}

	err := h.service.DeleteCategory(ctx, userID, model.CategoryID(categoryID))
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, []byte(`{"message": "category deleted successfully"}`))
}
