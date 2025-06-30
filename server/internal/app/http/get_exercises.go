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
		GetExercises(ctx context.Context, userID model.UserID, page, pageSize int) (*model.ExerciseListResponse, error)
		GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, page, pageSize int) (*model.ExerciseListResponse, error)
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

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	// Получаем параметры пагинации
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")
	language := r.URL.Query().Get("language")
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

	var exercises *model.ExerciseListResponse
	var err error
	if langPtr != nil || catPtr != nil {
		exercises, err = h.service.GetExercisesFiltered(ctx, userID, langPtr, catPtr, page, pageSize)
	} else {
		exercises, err = h.service.GetExercises(ctx, userID, page, pageSize)
	}
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
