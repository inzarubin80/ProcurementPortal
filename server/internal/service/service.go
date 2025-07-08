package service

import (
	"context"
	"errors"
	authinterface "inzarubin80/MemCode/internal/app/authinterface"
	"inzarubin80/MemCode/internal/model"
)

type (
	PokerService struct {
		repository          Repository
		accessTokenService  TokenService
		refreshTokenService TokenService
		providersUserData   authinterface.ProvidersUserData
	}

	Repository interface {

		//User
		GetUserAuthProvidersByProviderUid(ctx context.Context, ProviderUid string, Provider string) (*model.UserAuthProviders, error)
		AddUserAuthProviders(ctx context.Context, userProfileFromProvide *model.UserProfileFromProvider, userID model.UserID) (*model.UserAuthProviders, error)
		CreateUser(ctx context.Context, userData *model.UserProfileFromProvider) (*model.User, error)
		GetUsersByIDs(ctx context.Context, userIDs []model.UserID) ([]*model.User, error)
		SetUserName(ctx context.Context, userID model.UserID, name string) error
		GetUser(ctx context.Context, userID model.UserID) (*model.User, error)

		//Exercise
		CreateExercise(ctx context.Context, exercise *model.Exercise) (*model.Exercise, error)
		GetExercise(ctx context.Context, userID model.UserID, exerciseID int64) (*model.Exercise, error)
		UpdateExercise(ctx context.Context, exercise *model.Exercise) (*model.Exercise, error)
		DeleteExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
		GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, page, pageSize int) ([]*model.ExerciseDetailse, int, error)
		UpsertExerciseStat(ctx context.Context, userID model.UserID, exerciseID int64, attempts int, successAttempts int) (*model.ExerciseStat, error)
		GetExerciseStat(ctx context.Context, userID model.UserID, exerciseID int64) (*model.ExerciseStat, error)

		//Category
		CreateCategory(ctx context.Context, category *model.Category) (*model.Category, error)
		GetCategories(ctx context.Context, userID model.UserID, page, pageSize int) ([]*model.Category, int, error)
		GetCategory(ctx context.Context, userID model.UserID, categoryID int64) (*model.Category, error)
		UpdateCategory(ctx context.Context, category *model.Category) (*model.Category, error)
		DeleteCategory(ctx context.Context, userID model.UserID, categoryID int64) error
		CountExercisesByCategory(ctx context.Context, categoryID int64) (int64, error)

		// User Stats
		GetUserStats(ctx context.Context, userID model.UserID) (*model.UserStats, error)

		// User Exercises
		GetUserExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID int64, page, pageSize int) ([]*model.ExerciseDetailse, int, error)
		AddUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
		RemoveUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error
		GetUserExerciseIDs(ctx context.Context, userID model.UserID) ([]int64, error)

		IsExerciseSolvedByUser(ctx context.Context, userID model.UserID, exerciseID int64) (bool, error)
		IsUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) (bool, error)
	}

	TokenService interface {
		GenerateToken(userID model.UserID) (string, error)
		ValidateToken(tokenString string) (*model.Claims, error)
	}

	ProviderUserData interface {
		GetUserData(ctx context.Context, authorizationCode string) (*model.UserProfileFromProvider, error)
	}
)

func NewPokerService(repository Repository, accessTokenService TokenService, refreshTokenService TokenService, providersUserData authinterface.ProvidersUserData) *PokerService {
	return &PokerService{
		repository:          repository,
		accessTokenService:  accessTokenService,
		refreshTokenService: refreshTokenService,
		providersUserData:   providersUserData,
	}
}

// Методы для упражнений
func (s *PokerService) CreateExercise(ctx context.Context, userID model.UserID, exercise *model.Exercise) (*model.Exercise, error) {
	return s.repository.CreateExercise(ctx, exercise)
}

func (s *PokerService) GetExercise(ctx context.Context, userID model.UserID, exerciseID int64) (*model.ExerciseDetailse, error) {
	exercise, err := s.repository.GetExercise(ctx, userID, exerciseID)
	if err != nil {
		return nil, err
	}
	isSolved, err := s.repository.IsExerciseSolvedByUser(ctx, userID, exerciseID)
	if err != nil {
		return nil, err
	}
	isUserExercise, err := s.repository.IsUserExercise(ctx, userID, exerciseID)
	if err != nil {
		return nil, err
	}
	userIfo := model.UserInfo{
		IsSolved:       isSolved,
		IsUserExercise: isUserExercise,
	}
	return &model.ExerciseDetailse{
		UserIfo:  userIfo,
		Exercise: *exercise,
	}, nil
}

func (s *PokerService) UpdateExercise(ctx context.Context, userID model.UserID, exerciseID int64, exercise *model.Exercise) (*model.Exercise, error) {
	// Проверяем, что упражнение принадлежит пользователю
	existingExercise, err := s.repository.GetExercise(ctx, userID, exerciseID)
	if err != nil {
		return nil, err
	}
	if existingExercise == nil {
		return nil, errors.New("exercise not found or does not belong to user")
	}

	// Устанавливаем ID и UserID из существующего упражнения
	exercise.ID = exerciseID
	exercise.UserID = model.UserID(userID)

	return s.repository.UpdateExercise(ctx, exercise)
}

func (s *PokerService) DeleteExercise(ctx context.Context, userID model.UserID, exerciseID int64) error {
	// Проверяем, что упражнение принадлежит пользователю
	existingExercise, err := s.repository.GetExercise(ctx, userID, exerciseID)
	if err != nil {
		return err
	}
	if existingExercise == nil {
		return errors.New("exercise not found or does not belong to user")
	}

	return s.repository.DeleteExercise(ctx, userID, exerciseID)
}

// Методы для категорий
func (s *PokerService) CreateCategory(ctx context.Context, userID model.UserID, category *model.Category) (*model.Category, error) {
	category.UserID = userID
	return s.repository.CreateCategory(ctx, category)
}

func (s *PokerService) GetCategories(ctx context.Context, userID model.UserID, page, pageSize int) (model.CategoryListResponse, error) {
	categories, total, err := s.repository.GetCategories(ctx, userID, page, pageSize)
	if err != nil {
		return model.CategoryListResponse{}, err
	}

	hasNext := (page * pageSize) < total
	hasPrev := page > 1

	return model.CategoryListResponse{
		Categories: categories,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		HasNext:    hasNext,
		HasPrev:    hasPrev,
	}, nil
}

func (s *PokerService) GetCategory(ctx context.Context, userID model.UserID, categoryID int64) (*model.Category, error) {
	return s.repository.GetCategory(ctx, userID, categoryID)
}

func (s *PokerService) UpdateCategory(ctx context.Context, userID model.UserID, categoryID int64, category *model.Category) (*model.Category, error) {
	// Проверяем, что категория принадлежит пользователю
	existingCategory, err := s.repository.GetCategory(ctx, userID, categoryID)
	if err != nil {
		return nil, err
	}
	if existingCategory == nil {
		return nil, errors.New("category not found or does not belong to user")
	}

	// Устанавливаем ID и UserID из существующей категории
	category.ID = categoryID
	category.UserID = userID

	return s.repository.UpdateCategory(ctx, category)
}

func (s *PokerService) DeleteCategory(ctx context.Context, userID model.UserID, categoryID int64) error {
	// Проверяем, что категория принадлежит пользователю
	existingCategory, err := s.repository.GetCategory(ctx, userID, categoryID)
	if err != nil {
		return err
	}
	if existingCategory == nil {
		return errors.New("category not found or does not belong to user")
	}

	count, err := s.repository.CountExercisesByCategory(ctx, categoryID)
	if err != nil {
		return err
	}
	if count > 0 {
		return errors.New("category contains exercises and cannot be deleted")
	}

	return s.repository.DeleteCategory(ctx, userID, categoryID)
}

func (s *PokerService) GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID *string, page, pageSize int) (*model.ExerciseListWithUserResponse, error) {
	detailseList, total, err := s.repository.GetExercisesFiltered(ctx, userID, language, categoryID, page, pageSize)
	if err != nil {
		return nil, err
	}
	hasNext := (page * pageSize) < total
	hasPrev := page > 1

	return &model.ExerciseListWithUserResponse{
		ExeExerciseDetailse: detailseList,
		Total:               total,
		Page:                page,
		PageSize:            pageSize,
		HasNext:             hasNext,
		HasPrev:             hasPrev,
	}, nil
}

func (s *PokerService) UpsertExerciseStat(userID model.UserID, exerciseID int64, attempts int, successAttempts int) (*model.ExerciseStat, error) {
	return s.repository.UpsertExerciseStat(context.Background(), userID, exerciseID, attempts, successAttempts)
}

func (s *PokerService) GetExerciseStat(userID model.UserID, exerciseID int64) (*model.ExerciseStat, error) {
	return s.repository.GetExerciseStat(context.Background(), userID, exerciseID)
}

func (s *PokerService) GetUserStats(ctx context.Context, userID model.UserID) (*model.UserStats, error) {
	return s.repository.GetUserStats(ctx, userID)
}

func (s *PokerService) GetUserExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID int64, page, pageSize int) (*model.ExerciseListWithUserResponse, error) {
	detailseList, total, err := s.repository.GetUserExercisesFiltered(ctx, userID, language, categoryID, page, pageSize)
	if err != nil {
		return nil, err
	}
	hasNext := (page * pageSize) < total
	hasPrev := page > 1

	return &model.ExerciseListWithUserResponse{
		ExeExerciseDetailse: detailseList,
		Total:               total,
		Page:                page,
		PageSize:            pageSize,
		HasNext:             hasNext,
		HasPrev:             hasPrev,
	}, nil
}

func (s *PokerService) AddUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error {
	return s.repository.AddUserExercise(ctx, userID, exerciseID)
}

func (s *PokerService) GetUser(ctx context.Context, userID model.UserID) (*model.User, error) {
	return s.repository.GetUser(ctx, userID)
}

func (s *PokerService) SetUserName(ctx context.Context, userID model.UserID, name string) error {
	return s.repository.SetUserName(ctx, userID, name)
}

func (s *PokerService) RemoveUserExercise(ctx context.Context, userID model.UserID, exerciseID int64) error {
	return s.repository.RemoveUserExercise(ctx, userID, exerciseID)
}
