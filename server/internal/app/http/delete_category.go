package http

import (
	"context"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
	"strconv"
)

// DeleteCategory godoc
// @Summary      Удалить категорию
// @Description  Удаляет категорию по ID
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id path string true "ID категории"
// @Success      200      {object}  uhttp.SuccessResponse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /categories/{id} [delete]

type (
	DeleteCategoryService interface {
		DeleteCategory(ctx context.Context, userID model.UserID, isAdmin bool, categoryID int64) error
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

	categoryID, err := strconv.ParseInt(categoryIDStr, 10, 64)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid category_id")
		return
	}

	isAdmin, _ := ctx.Value(defenitions.IsAdminKey).(bool)
	err = h.service.DeleteCategory(ctx, userID, isAdmin, categoryID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, []byte(`{"message": "category deleted successfully"}`))
}
