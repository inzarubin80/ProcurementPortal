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

type (
	GetExercisesService interface {
		GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, page, pageSize int) (*model.ExerciseListWithUserResponse, error)
	}

	GetExercisesHandler struct {
		name    string
		service GetExercisesService
	}
)

func NewGetExercisesHandler(service GetExercisesService, name string) *GetExercisesHandler {
	return &GetExercisesHandler{
		name:    name,
		service: service,
	}
}

func (h *GetExercisesHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(int64)
	if !ok {
		userID = 0 // Для неавторизованных пользователей
	}

	// Получаем параметры пагинации
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")
	language := r.URL.Query().Get("programming_language")
	categoryID := r.URL.Query().Get("category_id")

	page := 1
	pageSize := 10

	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if pageSizeStr != "" {
		if ps, err := strconv.Atoi(pageSizeStr); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	var langPtr, catPtr *string
	if language != "" {
		langPtr = &language
	}
	if categoryID != "" {
		catPtr = &categoryID
	}

	var exercises *model.ExerciseListWithUserResponse
	var err error

	exercises, err = h.service.GetExercisesFiltered(ctx, model.UserID(userID), langPtr, catPtr, page, pageSize)

	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, err := json.Marshal(exercises)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
