package http

import (
	"context"
	"encoding/json"
	"inzarubin80/MemCode/internal/app/defenitions"
	"inzarubin80/MemCode/internal/app/uhttp"
	"inzarubin80/MemCode/internal/model"
	"net/http"
)

// CreateExercise godoc
// @Summary      Создать упражнение
// @Description  Создаёт новое упражнение
// @Tags         exercises
// @Accept       json
// @Produce      json
// @Param        exercise body model.Exercise true "Данные упражнения"
// @Success      200      {object}  model.Exercise
// @Failure      400      {object}  uhttp.ErrorResponse
// @Router       /exercises [post]

type (
	CreateExerciseService interface {
		CreateExercise(ctx context.Context, userID model.UserID, isAdmin bool, exercise *model.Exercise) (*model.Exercise, error)
	}

	CreateExerciseHandler struct {
		name    string
		service CreateExerciseService
	}
)

func NewCreateExerciseHandler(service CreateExerciseService, name string) *CreateExerciseHandler {
	return &CreateExerciseHandler{
		name:    name,
		service: service,
	}
}

func (h *CreateExerciseHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(defenitions.UserIDKey).(model.UserID)
	if !ok {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, "not user ID")
		return
	}

	var exercise model.Exercise
	if err := json.NewDecoder(r.Body).Decode(&exercise); err != nil {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Устанавливаем user_id из контекста
	exercise.UserID = userID

	// Валидация обязательных полей
	if exercise.Title == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "title is required")
		return
	}
	if exercise.CodeToRemember == "" {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "code_to_remember is required")
		return
	}

	// Валидация поддерживаемого языка программирования
	if exercise.ProgrammingLanguage != "" && !model.IsSupportedLanguage(exercise.ProgrammingLanguage) {
		uhttp.SendErrorResponse(w, http.StatusBadRequest, "unsupported programming language")
		return
	}

	isAdmin, _ := ctx.Value(defenitions.IsAdminKey).(bool)
	createdExercise, err := h.service.CreateExercise(ctx, userID, isAdmin, &exercise)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	// Wrap in ExerciseDetailse with default UserInfo
	detailse := model.ExerciseDetailse{
		UserIfo:  model.UserInfo{IsSolved: false, IsUserExercise: false},
		Exercise: *createdExercise,
	}

	jsonData, err := json.Marshal(detailse)
	if err != nil {
		uhttp.SendErrorResponse(w, http.StatusInternalServerError, err.Error())
		return
	}

	uhttp.SendSuccessfulResponse(w, jsonData)
}
