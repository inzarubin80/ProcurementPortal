package repository

import (
	"context"
	"inzarubin80/MemCode/internal/model"
	sqlc_repository "inzarubin80/MemCode/internal/repository_sqlc"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type (
	Repository struct {
		storage      Storage
		conn         DBTX
		queries      *sqlc_repository.Queries
		exerciseRepo *ExerciseRepository
		categoryRepo *CategoryRepository
	}

	DBTX interface {
		Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
		Query(context.Context, string, ...interface{}) (pgx.Rows, error)
		QueryRow(context.Context, string, ...interface{}) pgx.Row
	}

	Storage struct {
		mx *sync.RWMutex
	}
)

func NewPokerRepository(capacity int, conn DBTX) *Repository {
	pool, ok := conn.(*pgxpool.Pool)
	if !ok {
		panic("connection must be *pgxpool.Pool")
	}

	queries := sqlc_repository.New(pool)

	return &Repository{
		conn:         conn,
		queries:      queries,
		exerciseRepo: NewExerciseRepository(queries),
		categoryRepo: NewCategoryRepository(queries),
	}
}

// Методы упражнений - делегируем к ExerciseRepository
func (r *Repository) CreateExercise(ctx context.Context, exercise *model.Exercise) (*model.Exercise, error) {
	return r.exerciseRepo.CreateExercise(ctx, exercise)
}

func (r *Repository) GetExercises(ctx context.Context, userID model.UserID, page, pageSize int) ([]*model.Exercise, int, error) {
	return r.exerciseRepo.GetExercises(ctx, userID, page, pageSize)
}

func (r *Repository) GetExercise(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID) (*model.Exercise, error) {
	return r.exerciseRepo.GetExercise(ctx, userID, exerciseID)
}

func (r *Repository) UpdateExercise(ctx context.Context, exercise *model.Exercise) (*model.Exercise, error) {
	return r.exerciseRepo.UpdateExercise(ctx, exercise)
}

func (r *Repository) DeleteExercise(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID) error {
	return r.exerciseRepo.DeleteExercise(ctx, userID, exerciseID)
}

// Методы категорий - делегируем к CategoryRepository
func (r *Repository) CreateCategory(ctx context.Context, category *model.Category) (*model.Category, error) {
	return r.categoryRepo.CreateCategory(ctx, category)
}

func (r *Repository) GetCategories(ctx context.Context, userID model.UserID, page, pageSize int) ([]*model.Category, int, error) {
	return r.categoryRepo.GetCategories(ctx, userID, page, pageSize)
}

func (r *Repository) GetCategory(ctx context.Context, userID model.UserID, categoryID model.CategoryID) (*model.Category, error) {
	return r.categoryRepo.GetCategory(ctx, userID, categoryID)
}

func (r *Repository) UpdateCategory(ctx context.Context, category *model.Category) (*model.Category, error) {
	return r.categoryRepo.UpdateCategory(ctx, category)
}

func (r *Repository) DeleteCategory(ctx context.Context, userID model.UserID, categoryID model.CategoryID) error {
	return r.categoryRepo.DeleteCategory(ctx, userID, categoryID)
}

func (r *Repository) CountExercisesByCategory(ctx context.Context, categoryID model.CategoryID) (int64, error) {
	return r.categoryRepo.CountExercisesByCategory(ctx, categoryID)
}

func (r *Repository) GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, difficulty *string, page, pageSize int) ([]*model.Exercise, int, error) {
	return r.exerciseRepo.GetExercisesFiltered(ctx, userID, language, categoryID, difficulty, page, pageSize)
}

func (r *Repository) UpsertExerciseStat(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID, attempts int, successful int) (*model.ExerciseStat, error) {
	return r.exerciseRepo.UpsertExerciseStat(ctx, userID, exerciseID, attempts, successful, 0, 0)
}

func (r *Repository) GetExerciseStat(ctx context.Context, userID model.UserID, exerciseID model.ExerciseID) (*model.ExerciseStat, error) {
	return r.exerciseRepo.GetExerciseStat(ctx, userID, exerciseID)
}

func (r *Repository) GetUserStats(ctx context.Context, userID model.UserID) (*model.UserStats, error) {
	return r.exerciseRepo.GetUserStats(ctx, userID)
}

func (r *Repository) GetUserExercises(ctx context.Context, userID model.UserID, page, pageSize int) ([]*model.UserExerciseWithDetails, int, error) {
	return r.exerciseRepo.GetUserExercises(ctx, userID, page, pageSize)
}

func (r *Repository) GetUserExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, difficulty *string, page, pageSize int) ([]*model.UserExerciseWithDetails, int, error) {
	return r.exerciseRepo.GetUserExercisesFiltered(ctx, userID, language, categoryID, difficulty, page, pageSize)
}

func (r *Repository) AddUserExercise(ctx context.Context, userID model.UserID, exerciseID string) error {
	return r.exerciseRepo.AddUserExercise(ctx, userID, exerciseID)
}

func (r *Repository) RemoveUserExercise(ctx context.Context, userID model.UserID, exerciseID string) error {
	return r.exerciseRepo.RemoveUserExercise(ctx, userID, exerciseID)
}
