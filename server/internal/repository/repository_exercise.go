package repository

import (
	"context"
	"inzarubin80/MemCode/internal/model"
	sqlc_repository "inzarubin80/MemCode/internal/repository_sqlc"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type ExerciseRepository struct {
	queries *sqlc_repository.Queries
}

func NewExerciseRepository(queries *sqlc_repository.Queries) *ExerciseRepository {
	return &ExerciseRepository{
		queries: queries,
	}
}

func (r *ExerciseRepository) CreateExercise(ctx context.Context, exercise *model.Exercise) (*model.Exercise, error) {
	var categoryUUID pgtype.UUID
	if err := categoryUUID.Scan(exercise.CategoryID); err != nil {
		return nil, err
	}

	params := &sqlc_repository.CreateExerciseParams{
		UserID:              int64(exercise.UserID),
		Title:               exercise.Title,
		Description:         &exercise.Description,
		CategoryID:          categoryUUID,
		Difficulty:          string(exercise.Difficulty),
		ProgrammingLanguage: string(exercise.ProgrammingLanguage),
		CodeToRemember:      exercise.CodeToRemember,
	}

	sqlcExercise, err := r.queries.CreateExercise(ctx, params)
	if err != nil {
		return nil, err
	}

	return convertSQLCExerciseToModel(sqlcExercise), nil
}

func (r *ExerciseRepository) GetExercises(ctx context.Context, userID model.UserID, page, pageSize int) ([]*model.Exercise, int, error) {
	// Получаем общее количество
	total, err := r.queries.CountExercises(ctx, int64(userID))
	if err != nil {
		return nil, 0, err
	}

	// Получаем упражнения с пагинацией
	offset := (page - 1) * pageSize
	params := &sqlc_repository.GetExercisesParams{
		UserID: int64(userID),
		Limit:  int32(pageSize),
		Offset: int32(offset),
	}

	sqlcRows, err := r.queries.GetExercises(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	exercises := make([]*model.Exercise, len(sqlcRows))
	for i, row := range sqlcRows {
		description := ""
		if row.Description != nil {
			description = *row.Description
		}
		isActive := true
		if row.IsActive != nil {
			isActive = *row.IsActive
		}
		isSolved := false
		if row.SuccessfulAttempts != nil && *row.SuccessfulAttempts > 0 {
			isSolved = true
		}
		exercises[i] = &model.Exercise{
			ID:                  row.ID.String(),
			UserID:              model.UserID(row.UserID),
			Title:               row.Title,
			Description:         description,
			CategoryID:          row.CategoryID.String(),
			Difficulty:          model.Difficulty(row.Difficulty),
			ProgrammingLanguage: model.ProgrammingLanguage(row.ProgrammingLanguage),
			CodeToRemember:      row.CodeToRemember,
			CreatedAt:           row.CreatedAt.Time,
			UpdatedAt:           row.UpdatedAt.Time,
			IsActive:            isActive,
			IsSolved:            isSolved,
			IsUserExercise:      row.IsUserExercise,
		}
	}

	return exercises, int(total), nil
}

func (r *ExerciseRepository) GetExercise(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID) (*model.Exercise, error) {
	params := &sqlc_repository.GetExerciseParams{
		ID:     pgtype.UUID(exerciseID),
		UserID: int64(userID),
	}

	sqlcExercise, err := r.queries.GetExercise(ctx, params)
	if err != nil {
		return nil, err
	}

	return convertSQLCExerciseToModel(sqlcExercise), nil
}

func (r *ExerciseRepository) UpdateExercise(ctx context.Context, exercise *model.Exercise) (*model.Exercise, error) {
	var categoryUUID pgtype.UUID
	if err := categoryUUID.Scan(exercise.CategoryID); err != nil {
		return nil, err
	}

	var exerciseUUID pgtype.UUID
	if err := exerciseUUID.Scan(exercise.ID); err != nil {
		return nil, err
	}

	params := &sqlc_repository.UpdateExerciseParams{
		Title:               exercise.Title,
		Description:         &exercise.Description,
		CategoryID:          categoryUUID,
		Difficulty:          string(exercise.Difficulty),
		ProgrammingLanguage: string(exercise.ProgrammingLanguage),
		CodeToRemember:      exercise.CodeToRemember,
		ID:                  exerciseUUID,
		UserID:              int64(exercise.UserID),
	}

	sqlcExercise, err := r.queries.UpdateExercise(ctx, params)
	if err != nil {
		return nil, err
	}

	return convertSQLCExerciseToModel(sqlcExercise), nil
}

func (r *ExerciseRepository) DeleteExercise(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID) error {
	params := &sqlc_repository.DeleteExerciseParams{
		ID:     pgtype.UUID(exerciseID),
		UserID: int64(userID),
	}

	err := r.queries.DeleteExercise(ctx, params)
	if err != nil {
		return err
	}

	return nil
}

func (r *ExerciseRepository) GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, difficulty *string, page, pageSize int) ([]*model.Exercise, int, error) {
	var langValue string
	var diffValue string
	if language != nil && *language != "" {
		langValue = *language
	}
	if difficulty != nil && *difficulty != "" {
		diffValue = *difficulty
	}
	var catUUID pgtype.UUID
	if categoryID != nil && *categoryID != "" {
		_ = catUUID.Scan(*categoryID)
	}
	// Получаем общее количество
	countParams := &sqlc_repository.CountExercisesFilteredParams{
		UserID:  int64(userID),
		Column2: langValue,
		Column3: catUUID,
		Column4: diffValue,
	}
	total, err := r.queries.CountExercisesFiltered(ctx, countParams)
	if err != nil {
		return nil, 0, err
	}
	// Получаем упражнения с пагинацией
	offset := (page - 1) * pageSize
	exParams := &sqlc_repository.GetExercisesFilteredParams{
		UserID:  int64(userID),
		Column2: langValue,
		Column3: catUUID,
		Column4: diffValue,
		Limit:   int32(pageSize),
		Offset:  int32(offset),
	}
	sqlcRows, err := r.queries.GetExercisesFiltered(ctx, exParams)
	if err != nil {
		return nil, 0, err
	}
	exercises := make([]*model.Exercise, len(sqlcRows))
	for i, row := range sqlcRows {
		description := ""
		if row.Description != nil {
			description = *row.Description
		}
		isActive := true
		if row.IsActive != nil {
			isActive = *row.IsActive
		}
		isSolved := false
		if row.SuccessfulAttempts != nil && *row.SuccessfulAttempts > 0 {
			isSolved = true
		}
		exercises[i] = &model.Exercise{
			ID:                  row.ID.String(),
			UserID:              model.UserID(row.UserID),
			Title:               row.Title,
			Description:         description,
			CategoryID:          row.CategoryID.String(),
			Difficulty:          model.Difficulty(row.Difficulty),
			ProgrammingLanguage: model.ProgrammingLanguage(row.ProgrammingLanguage),
			CodeToRemember:      row.CodeToRemember,
			CreatedAt:           row.CreatedAt.Time,
			UpdatedAt:           row.UpdatedAt.Time,
			IsActive:            isActive,
			IsSolved:            isSolved,
			IsUserExercise:      row.IsUserExercise,
		}
	}
	return exercises, int(total), nil
}

func (r *ExerciseRepository) GetExerciseStat(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID) (*model.ExerciseStat, error) {
	params := sqlc_repository.GetExerciseStatParams{
		UserID:     int64(userID),
		ExerciseID: pgtype.UUID(exerciseID),
	}
	stat, err := r.queries.GetExerciseStat(ctx, &params)
	if err != nil {
		return nil, err
	}
	return &model.ExerciseStat{
		UserID:             model.UserID(stat.UserID),
		ExerciseID:         stat.ExerciseID.String(),
		TotalAttempts:      int(stat.TotalAttempts),
		SuccessfulAttempts: int(stat.SuccessfulAttempts),
		TotalTypingTime:    stat.TotalTypingTime,
		TotalTypedChars:    int(stat.TotalTypedChars),
	}, nil
}

func (r *ExerciseRepository) UpsertExerciseStat(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID, attempts, successAttempts int, typingTime int64, typedChars int) (*model.ExerciseStat, error) {
	params := sqlc_repository.UpsertExerciseStatParams{
		UserID:             int64(userID),
		ExerciseID:         pgtype.UUID(exerciseID),
		TotalAttempts:      int32(attempts),
		SuccessfulAttempts: int32(successAttempts),
		TotalTypingTime:    typingTime,
		TotalTypedChars:    int32(typedChars),
	}
	stat, err := r.queries.UpsertExerciseStat(ctx, &params)
	if err != nil {
		return nil, err
	}
	return &model.ExerciseStat{
		UserID:             model.UserID(stat.UserID),
		ExerciseID:         stat.ExerciseID.String(),
		TotalAttempts:      int(stat.TotalAttempts),
		SuccessfulAttempts: int(stat.SuccessfulAttempts),
		TotalTypingTime:    stat.TotalTypingTime,
		TotalTypedChars:    int(stat.TotalTypedChars),
	}, nil
}

func (r *ExerciseRepository) GetUserStats(ctx context.Context, userID model.UserID) (*model.UserStats, error) {
	stats, err := r.queries.GetUserStats(ctx, int64(userID))
	if err != nil {
		return nil, err
	}

	// totalAttempts and totalTime are now int64
	return &model.UserStats{
		UserID:             model.UserID(stats.UserID),
		TotalExercises:     int(stats.TotalExercises),
		CompletedExercises: int(stats.CompletedExercises),
		AverageScore:       int(stats.AverageScore),
		TotalTime:          stats.TotalTime,
		TotalAttempts:      int(stats.TotalAttempts),
	}, nil
}

func (r *ExerciseRepository) GetUserExercises(ctx context.Context, userID model.UserID, page, pageSize int) ([]*model.UserExerciseWithDetails, int, error) {
	// Получаем общее количество
	total, err := r.queries.CountUserExercises(ctx, int64(userID))
	if err != nil {
		return nil, 0, err
	}

	// Получаем user_exercises с пагинацией
	offset := (page - 1) * pageSize
	params := &sqlc_repository.GetUserExercisesParams{
		UserID: int64(userID),
		Limit:  int32(pageSize),
		Offset: int32(offset),
	}

	sqlcRows, err := r.queries.GetUserExercises(ctx, params)
	if err != nil {
		return nil, 0, err
	}

	userExercises := make([]*model.UserExerciseWithDetails, len(sqlcRows))
	for i, row := range sqlcRows {
		userExercises[i] = convertSQLCUserExerciseToModel(row)
	}

	return userExercises, int(total), nil
}

func (r *ExerciseRepository) GetUserExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, difficulty *string, page, pageSize int) ([]*model.UserExerciseWithDetails, int, error) {
	var langValue string
	var diffValue string
	if language != nil && *language != "" {
		langValue = *language
	}
	if difficulty != nil && *difficulty != "" {
		diffValue = *difficulty
	}
	var catUUID pgtype.UUID
	if categoryID != nil && *categoryID != "" {
		_ = catUUID.Scan(*categoryID)
	}

	// Получаем общее количество
	countParams := &sqlc_repository.CountUserExercisesFilteredParams{
		UserID:  int64(userID),
		Column2: langValue,
		Column3: catUUID,
		Column4: diffValue,
	}
	total, err := r.queries.CountUserExercisesFiltered(ctx, countParams)
	if err != nil {
		return nil, 0, err
	}

	// Получаем user_exercises с пагинацией
	offset := (page - 1) * pageSize
	exParams := &sqlc_repository.GetUserExercisesFilteredParams{
		UserID:  int64(userID),
		Column2: langValue,
		Column3: catUUID,
		Column4: diffValue,
		Limit:   int32(pageSize),
		Offset:  int32(offset),
	}
	sqlcRows, err := r.queries.GetUserExercisesFiltered(ctx, exParams)
	if err != nil {
		return nil, 0, err
	}

	userExercises := make([]*model.UserExerciseWithDetails, len(sqlcRows))
	for i, row := range sqlcRows {
		userExercises[i] = convertSQLCUserExerciseToModel(row)
	}

	return userExercises, int(total), nil
}

// Вспомогательная функция для конвертации sqlc структуры в модель
func convertSQLCExerciseToModel(sqlcExercise *sqlc_repository.Exercise) *model.Exercise {
	description := ""
	if sqlcExercise.Description != nil {
		description = *sqlcExercise.Description
	}

	isActive := true
	if sqlcExercise.IsActive != nil {
		isActive = *sqlcExercise.IsActive
	}

	return &model.Exercise{
		ID:                  sqlcExercise.ID.String(),
		UserID:              model.UserID(sqlcExercise.UserID),
		Title:               sqlcExercise.Title,
		Description:         description,
		CategoryID:          sqlcExercise.CategoryID.String(),
		Difficulty:          model.Difficulty(sqlcExercise.Difficulty),
		ProgrammingLanguage: model.ProgrammingLanguage(sqlcExercise.ProgrammingLanguage),
		CodeToRemember:      sqlcExercise.CodeToRemember,
		CreatedAt:           sqlcExercise.CreatedAt.Time,
		UpdatedAt:           sqlcExercise.UpdatedAt.Time,
		IsActive:            isActive,
	}
}

// Вспомогательная функция для конвертации sqlc структуры UserExercise в модель
func convertSQLCUserExerciseToModel(row interface{}) *model.UserExerciseWithDetails {
	var userID int64
	var exerciseID pgtype.UUID
	var completedAt pgtype.Timestamptz
	var score *int32
	var attemptsCount *int32
	var ueCreatedAt pgtype.Timestamptz
	var ueUpdatedAt pgtype.Timestamptz
	var exerciseID2 pgtype.UUID
	var exerciseUserID int64
	var title string
	var description *string
	var categoryID pgtype.UUID
	var difficulty string
	var programmingLanguage string
	var codeToRemember string
	var exerciseCreatedAt pgtype.Timestamptz
	var exerciseUpdatedAt pgtype.Timestamptz
	var isActive *bool

	switch r := row.(type) {
	case *sqlc_repository.GetUserExercisesRow:
		userID = r.UserID
		exerciseID = r.ExerciseID
		completedAt = r.CompletedAt
		score = r.Score
		attemptsCount = r.AttemptsCount
		ueCreatedAt = r.UeCreatedAt
		ueUpdatedAt = r.UeUpdatedAt
		exerciseID2 = r.ExerciseID_2
		exerciseUserID = r.ExerciseUserID
		title = r.Title
		description = r.Description
		categoryID = r.CategoryID
		difficulty = r.Difficulty
		programmingLanguage = r.ProgrammingLanguage
		codeToRemember = r.CodeToRemember
		exerciseCreatedAt = r.ExerciseCreatedAt
		exerciseUpdatedAt = r.ExerciseUpdatedAt
		isActive = r.IsActive
	case *sqlc_repository.GetUserExercisesFilteredRow:
		userID = r.UserID
		exerciseID = r.ExerciseID
		completedAt = r.CompletedAt
		score = r.Score
		attemptsCount = r.AttemptsCount
		ueCreatedAt = r.UeCreatedAt
		ueUpdatedAt = r.UeUpdatedAt
		exerciseID2 = r.ExerciseID_2
		exerciseUserID = r.ExerciseUserID
		title = r.Title
		description = r.Description
		categoryID = r.CategoryID
		difficulty = r.Difficulty
		programmingLanguage = r.ProgrammingLanguage
		codeToRemember = r.CodeToRemember
		exerciseCreatedAt = r.ExerciseCreatedAt
		exerciseUpdatedAt = r.ExerciseUpdatedAt
		isActive = r.IsActive
	default:
		return nil
	}

	// Конвертируем UserExercise
	var completedAtPtr *time.Time
	if completedAt.Valid {
		completedAtPtr = &completedAt.Time
	}

	var scorePtr *int
	if score != nil {
		scoreVal := int(*score)
		scorePtr = &scoreVal
	}

	attemptsCountVal := 0
	if attemptsCount != nil {
		attemptsCountVal = int(*attemptsCount)
	}

	userExercise := &model.UserExercise{
		UserID:        model.UserID(userID),
		ExerciseID:    exerciseID.String(),
		CompletedAt:   completedAtPtr,
		Score:         scorePtr,
		AttemptsCount: attemptsCountVal,
		CreatedAt:     ueCreatedAt.Time,
		UpdatedAt:     ueUpdatedAt.Time,
	}

	// Конвертируем Exercise
	descriptionVal := ""
	if description != nil {
		descriptionVal = *description
	}
	isActiveVal := true
	if isActive != nil {
		isActiveVal = *isActive
	}

	exercise := &model.Exercise{
		ID:                  exerciseID2.String(),
		UserID:              model.UserID(exerciseUserID),
		Title:               title,
		Description:         descriptionVal,
		CategoryID:          categoryID.String(),
		Difficulty:          model.Difficulty(difficulty),
		ProgrammingLanguage: model.ProgrammingLanguage(programmingLanguage),
		CodeToRemember:      codeToRemember,
		CreatedAt:           exerciseCreatedAt.Time,
		UpdatedAt:           exerciseUpdatedAt.Time,
		IsActive:            isActiveVal,
		IsSolved:            false,
	}

	return &model.UserExerciseWithDetails{
		UserExercise: *userExercise,
		Exercise:     exercise,
	}
}

func (r *ExerciseRepository) AddUserExercise(ctx context.Context, userID model.UserID, exerciseID string) error {
	var exerciseUUID pgtype.UUID
	if err := exerciseUUID.Scan(exerciseID); err != nil {
		return err
	}

	params := &sqlc_repository.AddUserExerciseParams{
		UserID:     int64(userID),
		ExerciseID: exerciseUUID,
	}

	err := r.queries.AddUserExercise(ctx, params)
	if err != nil {
		return err
	}

	return nil
}

func (r *ExerciseRepository) RemoveUserExercise(ctx context.Context, userID model.UserID, exerciseID string) error {
	var exerciseUUID pgtype.UUID
	if err := exerciseUUID.Scan(exerciseID); err != nil {
		return err
	}

	params := &sqlc_repository.RemoveUserExerciseParams{
		UserID:     int64(userID),
		ExerciseID: exerciseUUID,
	}

	err := r.queries.RemoveUserExercise(ctx, params)
	if err != nil {
		return err
	}

	return nil
}
