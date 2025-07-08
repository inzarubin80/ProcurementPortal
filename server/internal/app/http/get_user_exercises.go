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

// GetUserExercises godoc
// @Summary      Получить упражнения пользователя
// @Description  Возвращает список упражнений, добавленных пользователем
// @Tags         user_exercises
// @Accept       json
// @Produce      json
// @Param        page     query     int     false  "Номер страницы"
// @Param        page_size query     int     false  "Размер страницы"
// @Param        programming_language query string false "Язык программирования"
// @Param        category_id query int false "ID категории"
// @Success      200      {object}  model.ExerciseListWithUserResponse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /user_exercises [get]

type (
	GetUserExercisesService interface {
		GetUserExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID int64, page int, pageSize int) (*model.ExerciseListWithUserResponse, error)
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
	strCategoryID := r.URL.Query().Get("category_id")

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

	var langPtr *string
	if language != "" {
		langPtr = &language
	}

	var categoryID int64 = 0
	if strCategoryID != "" {
		if cid, err := strconv.ParseInt(strCategoryID, 10, 64); err == nil {
			categoryID = cid
		} else {
			uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid category_id")
			return
		}
	}

	userExercises, err := h.service.GetUserExercisesFiltered(ctx, userID, langPtr, categoryID, page, pageSize)
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
