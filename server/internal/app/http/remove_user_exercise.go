package http

import (
	"context"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
	"strconv"
)

// RemoveUserExercise godoc
// @Summary      Удалить упражнение пользователя
// @Description  Удаляет упражнение из списка пользователя
// @Tags         user_exercises
// @Accept       json
// @Produce      json
// @Param        id path int true "ID упражнения"
// @Success      200      {object}  uhttp.SuccessResponse
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /user_exercises/{id} [delete]

type (
	RemoveUserExerciseService interface {
		RemoveUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
	}

	RemoveUserExerciseHandler struct {
		name    string
		service RemoveUserExerciseService
	}
)

func NewRemoveUserExerciseHandler(service RemoveUserExerciseService, name string) *RemoveUserExerciseHandler {
	return &RemoveUserExerciseHandler{
		name:    name,
		service: service,
	}
}

func (h *RemoveUserExerciseHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserID).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	// Получаем id из path
	idStr := ""
	if vals, ok := r.URL.Query()["id"]; ok && len(vals) > 0 {
		idStr = vals[0]
	} else {
		// Попытка получить из URL path, если используется стандартный net/http
		// /user_exercises/{id}
		// Например, если путь /user_exercises/123, то r.URL.Path = "/user_exercises/123"
		// Можно вручную извлечь id
		pathParts := splitPath(r.URL.Path)
		if len(pathParts) >= 2 {
			idStr = pathParts[len(pathParts)-1]
		}
	}

	if idStr == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "id is required in path")
		return
	}

	exerciseID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid id")
		return
	}

	err = h.service.RemoveUserExercise(ctx, userID, exerciseID)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, nil)
}

// splitPath разбивает путь на части, игнорируя пустые элементы
func splitPath(path string) []string {
	parts := []string{}
	start := 0
	for i := 0; i < len(path); i++ {
		if path[i] == '/' {
			if i > start {
				parts = append(parts, path[start:i])
			}
			start = i + 1
		}
	}
	if start < len(path) {
		parts = append(parts, path[start:])
	}
	return parts
}
