package repository

import (
	"context"
	"inzarubin80/MemCode/internal/model"
	sqlc_repository "inzarubin80/MemCode/internal/repository_sqlc"
)

type ExerciseRepository struct {
	queries *sqlc_repository.Queries
	conn    DBTX
}

func NewExerciseRepository(queries *sqlc_repository.Queries, conn DBTX) *ExerciseRepository {
	return &ExerciseRepository{
		queries: queries,
		conn:    conn,
	}
}

func (r *ExerciseRepository) CreateExercise(ctx context.Context, userID model.UserID, isAdmin bool, exercise *model.Exercise) (*model.Exercise, error) {
	// userID и isAdmin можно использовать для проверки прав, если потребуется
	params := &sqlc_repository.CreateExerciseParams{
		UserID:              int64(exercise.UserID),
		Title:               exercise.Title,
		Description:         &exercise.Description,
		CategoryID:          exercise.CategoryID,
		ProgrammingLanguage: string(exercise.ProgrammingLanguage),
		CodeToRemember:      exercise.CodeToRemember,
		IsCommon:            &exercise.IsCommon,
	}

	sqlcExercise, err := r.queries.CreateExercise(ctx, params)
	if err != nil {
		return nil, err
	}

	return &model.Exercise{
		ID:                  sqlcExercise.ID,
		UserID:              model.UserID(sqlcExercise.UserID),
		Title:               sqlcExercise.Title,
		Description:         *sqlcExercise.Description,
		CategoryID:          sqlcExercise.CategoryID,
		ProgrammingLanguage: model.ProgrammingLanguage(sqlcExercise.ProgrammingLanguage),
		CodeToRemember:      sqlcExercise.CodeToRemember,
		CreatedAt:           sqlcExercise.CreatedAt.Time,
		UpdatedAt:           sqlcExercise.UpdatedAt.Time,
		IsActive:            *sqlcExercise.IsActive,
		IsCommon:            *sqlcExercise.IsCommon,
	}, nil
}

func (r *ExerciseRepository) GetExercise(ctx context.Context, userID model.UserID, exerciseID int64) (*model.Exercise, error) {
	sqlcExercise, err := r.queries.GetExercise(ctx, exerciseID)
	if err != nil {
		return nil, err
	}
	return &model.Exercise{
		ID:                  sqlcExercise.ID,
		UserID:              model.UserID(sqlcExercise.UserID),
		Title:               sqlcExercise.Title,
		Description:         *sqlcExercise.Description,
		CategoryID:          sqlcExercise.CategoryID,
		ProgrammingLanguage: model.ProgrammingLanguage(sqlcExercise.ProgrammingLanguage),
		CodeToRemember:      sqlcExercise.CodeToRemember,
		CreatedAt:           sqlcExercise.CreatedAt.Time,
		UpdatedAt:           sqlcExercise.UpdatedAt.Time,
		IsActive:            *sqlcExercise.IsActive,
		IsCommon:            *sqlcExercise.IsCommon,
	}, nil
}

func (r *ExerciseRepository) UpdateExercise(ctx context.Context, userID model.UserID, isAdmin bool, exerciseID int64, exercise *model.Exercise) (*model.Exercise, error) {
	params := &sqlc_repository.UpdateExerciseParams{
		Title:               exercise.Title,
		Description:         &exercise.Description,
		CategoryID:          exercise.CategoryID,
		CodeToRemember:      exercise.CodeToRemember,
		ID:                  exercise.ID,
		UserID:              int64(exercise.UserID),
		ProgrammingLanguage: string(exercise.ProgrammingLanguage),
		IsCommon:            &exercise.IsCommon,
		Column9:             isAdmin,
	}

	sqlcExercise, err := r.queries.UpdateExercise(ctx, params)
	if err != nil {
		return nil, err
	}

	return &model.Exercise{
		ID:                  sqlcExercise.ID,
		UserID:              model.UserID(sqlcExercise.UserID),
		Title:               sqlcExercise.Title,
		Description:         *sqlcExercise.Description,
		CategoryID:          sqlcExercise.CategoryID,
		ProgrammingLanguage: model.ProgrammingLanguage(sqlcExercise.ProgrammingLanguage),
		CodeToRemember:      sqlcExercise.CodeToRemember,
		CreatedAt:           sqlcExercise.CreatedAt.Time,
		UpdatedAt:           sqlcExercise.UpdatedAt.Time,
		IsActive:            *sqlcExercise.IsActive,
		IsCommon:            *sqlcExercise.IsCommon,
	}, nil
}

func (r *ExerciseRepository) DeleteExercise(ctx context.Context, userID model.UserID, isAdmin bool, exerciseID int64) error {
	params := &sqlc_repository.DeleteExerciseParams{
		ID:      exerciseID,
		UserID:  int64(userID),
		Column3: isAdmin,
	}

	err := r.queries.DeleteExercise(ctx, params)
	if err != nil {
		return err
	}

	return nil
}

func (r *ExerciseRepository) GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID int64, page, pageSize int) ([]*model.ExerciseDetailse, int, error) {
	var langValue string
	if language != nil && *language != "" {
		langValue = *language
	}

	// Получаем общее количество
	countParams := &sqlc_repository.CountExercisesFilteredParams{
		UserID:  int64(userID),
		Column2: langValue,
		Column3: categoryID,
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
		Column3: categoryID,
		Limit:   int32(pageSize),
		Offset:  int32(offset),
	}
	sqlcRows, err := r.queries.GetExercisesFiltered(ctx, exParams)
	if err != nil {
		return nil, 0, err
	}
	exercises := make([]*model.ExerciseDetailse, len(sqlcRows))
	for i, row := range sqlcRows {
		description := ""
		if row.Description != nil {
			description = *row.Description
		}
		isActive := true
		if row.IsActive != nil {
			isActive = *row.IsActive
		}
		exercises[i] = &model.ExerciseDetailse{
			Exercise: model.Exercise{
				ID:                  row.ID,
				UserID:              model.UserID(row.UserID),
				Title:               row.Title,
				Description:         description,
				CategoryID:          row.CategoryID,
				ProgrammingLanguage: model.ProgrammingLanguage(row.ProgrammingLanguage),
				CodeToRemember:      row.CodeToRemember,
				CreatedAt:           row.CreatedAt.Time,
				UpdatedAt:           row.UpdatedAt.Time,
				IsActive:            isActive,
				IsCommon:            *row.IsCommon,
			},
			UserIfo: model.UserInfo{
				IsSolved:       row.IsSolved,
				IsUserExercise: row.IsUserExercise,
			},
		}
	}
	return exercises, int(total), nil
}

func (r *ExerciseRepository) GetExerciseStat(ctx context.Context, userID model.UserID, exerciseID int64) (*model.ExerciseStat, error) {
	params := sqlc_repository.GetExerciseStatParams{
		UserID:     int64(userID),
		ExerciseID: exerciseID,
	}
	stat, err := r.queries.GetExerciseStat(ctx, &params)
	if err != nil {
		return nil, err
	}
	return &model.ExerciseStat{
		UserID:             model.UserID(stat.UserID),
		ExerciseID:         stat.ExerciseID,
		TotalAttempts:      int(stat.TotalAttempts),
		SuccessfulAttempts: int(stat.SuccessfulAttempts),
		TotalTypingTime:    stat.TotalTypingTime,
		TotalTypedChars:    int(stat.TotalTypedChars),
	}, nil
}

func (r *ExerciseRepository) UpsertExerciseStat(ctx context.Context, userID model.UserID, exerciseID int64, attempts, successAttempts int, typingTime int64, typedChars int) (*model.ExerciseStat, error) {
	params := sqlc_repository.UpsertExerciseStatParams{
		UserID:             int64(userID),
		ExerciseID:         exerciseID,
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
		ExerciseID:         stat.ExerciseID,
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

func (r *ExerciseRepository) GetUserExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID int64, page, pageSize int) ([]*model.ExerciseDetailse, int, error) {
	var langValue string
	if language != nil && *language != "" {
		langValue = *language
	}

	// Получаем общее количество
	countParams := &sqlc_repository.CountUserExercisesFilteredParams{
		UserID:  int64(userID),
		Column2: langValue,
		Column3: categoryID,
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
		Column3: categoryID,
		Limit:   int32(pageSize),
		Offset:  int32(offset),
	}
	sqlcRows, err := r.queries.GetUserExercisesFiltered(ctx, exParams)
	if err != nil {
		return nil, 0, err
	}

	detailseList := make([]*model.ExerciseDetailse, len(sqlcRows))
	for i, row := range sqlcRows {
		description := ""
		if row.Description != nil {
			description = *row.Description
		}
		isActive := true
		if row.IsActive != nil {
			isActive = *row.IsActive
		}
		isCommon := false
		if row.IsCommon != nil {
			isCommon = *row.IsCommon
		}
		detailseList[i] = &model.ExerciseDetailse{
			Exercise: model.Exercise{
				ID:                  row.ExerciseID,
				UserID:              model.UserID(row.ExerciseUserID),
				Title:               row.Title,
				Description:         description,
				CategoryID:          row.CategoryID,
				ProgrammingLanguage: model.ProgrammingLanguage(row.ProgrammingLanguage),
				CodeToRemember:      row.CodeToRemember,
				CreatedAt:           row.CreatedAt.Time,
				UpdatedAt:           row.UpdatedAt.Time,
				IsActive:            isActive,
				IsCommon:            isCommon,
			},
			UserIfo: model.UserInfo{
				IsSolved:       row.IsSolved,
				IsUserExercise: row.IsUserExercise,
			},
		}
	}

	return detailseList, int(total), nil
}

func (r *ExerciseRepository) AddUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error {
	err := r.queries.AddUserExercise(ctx, &sqlc_repository.AddUserExerciseParams{
		UserID:     int64(userID),
		ExerciseID: exerciseID,
	})
	if err != nil {
		return err
	}

	return nil
}

func (r *ExerciseRepository) RemoveUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error {
	err := r.queries.RemoveUserExercise(ctx, &sqlc_repository.RemoveUserExerciseParams{
		UserID:     int64(userID),
		ExerciseID: exerciseID,
	})
	if err != nil {
		return err
	}

	return nil
}

func (r *ExerciseRepository) GetUserExerciseIDs(ctx context.Context, userID model.UserID) ([]int64, error) {
	ids, err := r.queries.GetUserExerciseIDs(ctx, int64(userID))
	if err != nil {
		return nil, err
	}
	return ids, nil
}

func (r *ExerciseRepository) IsExerciseSolvedByUser(ctx context.Context, userID model.UserID, exerciseID int64) (bool, error) {
	var count int
	row := r.conn.QueryRow(ctx, `SELECT COUNT(1) FROM user_exercises WHERE user_id = $1 AND exercise_id = $2 AND completed_at IS NOT NULL`, userID, exerciseID)
	if err := row.Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *ExerciseRepository) IsUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) (bool, error) {
	var count int
	row := r.conn.QueryRow(ctx, `SELECT COUNT(1) FROM user_exercises WHERE user_id = $1 AND exercise_id = $2`, userID, exerciseID)
	if err := row.Scan(&count); err != nil {
		return false, err
	}
	return count > 0, nil
}
