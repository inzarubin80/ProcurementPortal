package repository

import (
	"context"
	"inzarubin80/MemCode/internal/model"
	sqlc_repository "inzarubin80/MemCode/internal/repository_sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type CategoryRepository struct {
	queries *sqlc_repository.Queries
}

func NewCategoryRepository(queries *sqlc_repository.Queries) *CategoryRepository {
	return &CategoryRepository{
		queries: queries,
	}
}

func (r *CategoryRepository) CreateCategory(ctx context.Context, category *model.Category) (*model.Category, error) {
	dbCategory, err := r.queries.CreateCategory(ctx, &sqlc_repository.CreateCategoryParams{
		UserID:              int64(category.UserID),
		Name:                category.Name,
		Description:         &category.Description,
		ProgrammingLanguage: string(category.ProgrammingLanguage),
		Color:               &category.Color,
		Icon:                &category.Icon,
		Status:              &category.Status,
	})
	if err != nil {
		return nil, err
	}
	return convertDBCategoryToModel(dbCategory), nil
}

func (r *CategoryRepository) GetCategories(ctx context.Context, userID model.UserID, page, pageSize int) ([]*model.Category, int, error) {
	offset := (page - 1) * pageSize
	dbCategories, err := r.queries.GetCategories(ctx, &sqlc_repository.GetCategoriesParams{
		UserID: int64(userID),
		Limit:  int32(pageSize),
		Offset: int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}
	total, err := r.queries.CountCategories(ctx, int64(userID))
	if err != nil {
		return nil, 0, err
	}
	categories := make([]*model.Category, len(dbCategories))
	for i, dbCategory := range dbCategories {
		categories[i] = convertDBCategoryToModel(dbCategory)
	}
	return categories, int(total), nil
}

func (r *CategoryRepository) GetCategoriesByLanguage(ctx context.Context, userID model.UserID, language model.ProgrammingLanguage, page, pageSize int) ([]*model.Category, int, error) {
	offset := (page - 1) * pageSize
	dbCategories, err := r.queries.GetCategoriesByLanguage(ctx, &sqlc_repository.GetCategoriesByLanguageParams{
		UserID:              int64(userID),
		ProgrammingLanguage: string(language),
		Limit:               int32(pageSize),
		Offset:              int32(offset),
	})
	if err != nil {
		return nil, 0, err
	}
	total, err := r.queries.CountCategoriesByLanguage(ctx, &sqlc_repository.CountCategoriesByLanguageParams{
		UserID:              int64(userID),
		ProgrammingLanguage: string(language),
	})
	if err != nil {
		return nil, 0, err
	}
	categories := make([]*model.Category, len(dbCategories))
	for i, dbCategory := range dbCategories {
		categories[i] = convertDBCategoryToModel(dbCategory)
	}
	return categories, int(total), nil
}

func (r *CategoryRepository) GetCategory(ctx context.Context, userID model.UserID, categoryID model.CategoryID) (*model.Category, error) {
	dbCategory, err := r.queries.GetCategory(ctx, &sqlc_repository.GetCategoryParams{
		ID:     pgtype.UUID(categoryID),
		UserID: int64(userID),
	})
	if err != nil {
		return nil, err
	}
	return convertDBCategoryToModel(dbCategory), nil
}

func (r *CategoryRepository) UpdateCategory(ctx context.Context, category *model.Category) (*model.Category, error) {
	var categoryUUID pgtype.UUID
	if err := categoryUUID.Scan(category.ID); err != nil {
		return nil, err
	}

	dbCategory, err := r.queries.UpdateCategory(ctx, &sqlc_repository.UpdateCategoryParams{
		Name:                category.Name,
		Description:         &category.Description,
		ProgrammingLanguage: string(category.ProgrammingLanguage),
		Color:               &category.Color,
		Icon:                &category.Icon,
		Status:              &category.Status,
		ID:                  categoryUUID,
		UserID:              int64(category.UserID),
	})
	if err != nil {
		return nil, err
	}
	return convertDBCategoryToModel(dbCategory), nil
}

func (r *CategoryRepository) DeleteCategory(ctx context.Context, userID model.UserID, categoryID model.CategoryID) error {
	return r.queries.DeleteCategory(ctx, &sqlc_repository.DeleteCategoryParams{
		ID:     pgtype.UUID(categoryID),
		UserID: int64(userID),
	})
}

func (r *CategoryRepository) CountExercisesByCategory(ctx context.Context, categoryID model.CategoryID) (int64, error) {
	return r.queries.CountExercisesByCategory(ctx, pgtype.UUID(categoryID))
}

func convertDBCategoryToModel(dbCategory *sqlc_repository.Category) *model.Category {
	if dbCategory == nil {
		return nil
	}
	return &model.Category{
		ID:                  dbCategory.ID.String(),
		UserID:              model.UserID(dbCategory.UserID),
		Name:                dbCategory.Name,
		Description:         derefString(dbCategory.Description),
		ProgrammingLanguage: model.ProgrammingLanguage(dbCategory.ProgrammingLanguage),
		Color:               derefString(dbCategory.Color),
		Icon:                derefString(dbCategory.Icon),
		Status:              derefString(dbCategory.Status),
		CreatedAt:           dbCategory.CreatedAt.Time,
		UpdatedAt:           dbCategory.UpdatedAt.Time,
		IsActive:            derefBool(dbCategory.IsActive),
	}
}

func derefString(s *string) string {
	if s != nil {
		return *s
	}
	return ""
}

func derefBool(b *bool) bool {
	if b != nil {
		return *b
	}
	return false
}
