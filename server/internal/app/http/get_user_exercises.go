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
	GetUserExercisesService interface {
		GetUserExercises(ctx context.Context, userID model.UserID, page, pageSize int) (*model.UserExerciseListResponse, error)
		GetUserExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, difficulty *string, page, pageSize int) (*model.UserExerciseListResponse, error)
	}

	GetUserExercisesHandler struct {
		name    string
		service GetUserExercisesService
	}
)

func NewGetUserExercisesHandler(service GetUserExercisesService, name string) *GetUserExercisesHandler {
	return &GetUserExercisesHandler{
		name:    name,
		service: service,
	}
}

func (h *GetUserExercisesHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	// Получаем параметры пагинации
	pageStr := r.URL.Query().Get("page")
	pageSizeStr := r.URL.Query().Get("page_size")
	language := r.URL.Query().Get("programming_language")
	categoryID := r.URL.Query().Get("category_id")
	difficulty := r.URL.Query().Get("difficulty")

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

	var langPtr, catPtr, diffPtr *string
	if language != "" {
		langPtr = &language
	}
	if categoryID != "" {
		catPtr = &categoryID
	}
	if difficulty != "" {
		diffPtr = &difficulty
	}

	var userExercises *model.UserExerciseListResponse
	var err error
	if langPtr != nil || catPtr != nil || diffPtr != nil {
		userExercises, err = h.service.GetUserExercisesFiltered(ctx, userID, langPtr, catPtr, diffPtr, page, pageSize)
	} else {
		userExercises, err = h.service.GetUserExercises(ctx, userID, page, pageSize)
	}
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	jsonData, err := json.Marshal(userExercises)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
