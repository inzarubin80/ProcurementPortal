package repository

import (
	"context"
	"inzarubin80/MemCode/internal/model"
	sqlc_repository "inzarubin80/MemCode/internal/repository_sqlc"
)

type CategoryRepository struct {
	queries *sqlc_repository.Queries
}

func NewCategoryRepository(queries *sqlc_repository.Queries) *CategoryRepository {
	return &CategoryRepository{
		queries: queries,
	}
}

func (r *CategoryRepository) CreateCategory(ctx context.Context, userID model.UserID, isAdmin bool, category *model.Category) (*model.Category, error) {
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

func (r *CategoryRepository) GetCategories(ctx context.Context, userID model.UserID) ([]*model.Category, int, error) {
	dbCategories, err := r.queries.GetCategories(ctx, int64(userID))
	if err != nil {
		return nil, 0, err
	}
	total := len(dbCategories)
	categories := make([]*model.Category, len(dbCategories))
	for i, dbCategory := range dbCategories {
		categories[i] = convertDBCategoryToModel(dbCategory)
	}
	return categories, total, nil
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

func (r *CategoryRepository) GetCategory(ctx context.Context, userID model.UserID, categoryID int64) (*model.Category, error) {
	dbCategory, err := r.queries.GetCategory(ctx, &sqlc_repository.GetCategoryParams{
		ID:     int64(categoryID),
		UserID: int64(userID),
	})
	if err != nil {
		return nil, err
	}
	return convertDBCategoryToModel(dbCategory), nil
}

func (r *CategoryRepository) UpdateCategory(ctx context.Context, userID model.UserID, isAdmin bool, categoryID int64, category *model.Category) (*model.Category, error) {
	params := &sqlc_repository.UpdateCategoryParams{
		Name:                category.Name,
		Description:         &category.Description,
		ProgrammingLanguage: string(category.ProgrammingLanguage),
		Color:               &category.Color,
		Icon:                &category.Icon,
		Status:              &category.Status,
		IsCommon:            &category.IsCommon,
		ID:                  int64(category.ID),
		UserID:              int64(category.UserID),
		Column10:            isAdmin,
	}
	dbCategory, err := r.queries.UpdateCategory(ctx, params)
	if err != nil {
		return nil, err
	}
	return convertDBCategoryToModel(dbCategory), nil
}

func (r *CategoryRepository) DeleteCategory(ctx context.Context, userID model.UserID, isAdmin bool, categoryID int64) error {
	params := &sqlc_repository.DeleteCategoryParams{
		ID:      int64(categoryID),
		UserID:  int64(userID),
		Column3: isAdmin,
	}
	return r.queries.DeleteCategory(ctx, params)
}

func (r *CategoryRepository) CountExercisesByCategory(ctx context.Context, categoryID int64) (int64, error) {
	return r.queries.CountExercisesByCategory(ctx, categoryID)
}

func convertDBCategoryToModel(dbCategory *sqlc_repository.Category) *model.Category {
	if dbCategory == nil {
		return nil
	}
	return &model.Category{
		ID:                  dbCategory.ID,
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
		IsCommon:            derefBool(dbCategory.IsCommon),
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
