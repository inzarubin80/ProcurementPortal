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
		GetAllUsers(ctx context.Context) ([]*model.User, error)
		SetUserAdmin(ctx context.Context, userID model.UserID, isAdmin bool) (*model.User, error)

		//Exercise
		CreateExercise(ctx context.Context, userID model.UserID, isAdmin bool, exercise *model.Exercise) (*model.Exercise, error)
		GetExercise(ctx context.Context, userID model.UserID, exerciseID int64) (*model.Exercise, error)
		UpdateExercise(ctx context.Context, userID model.UserID, isAdmin bool, exerciseID int64, exercise *model.Exercise) (*model.Exercise, error)
		DeleteExercise(ctx context.Context, userID model.UserID, isAdmin bool, exerciseID int64) error
		GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID int64, page, pageSize int) ([]*model.ExerciseDetailse, int, error)
		UpsertExerciseStat(ctx context.Context, userID model.UserID, exerciseID int64, attempts int, successAttempts int) (*model.ExerciseStat, error)
		GetExerciseStat(ctx context.Context, userID model.UserID, exerciseID int64) (*model.ExerciseStat, error)

		//Category
		CreateCategory(ctx context.Context, userID model.UserID, isAdmin bool, category *model.Category) (*model.Category, error)
		GetCategories(ctx context.Context, userID model.UserID) ([]*model.Category, int, error)
		GetCategory(ctx context.Context, userID model.UserID, categoryID int64) (*model.Category, error)
		UpdateCategory(ctx context.Context, userID model.UserID, isAdmin bool, categoryID int64, category *model.Category) (*model.Category, error)
		DeleteCategory(ctx context.Context, userID model.UserID, isAdmin bool, categoryID int64) error
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

		// Refresh Tokens
		CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error
		GetRefreshTokenByToken(ctx context.Context, token string) (*model.RefreshToken, error)
		RevokeRefreshToken(ctx context.Context, token string) error
		DeleteRefreshTokenByToken(ctx context.Context, token string) error
		DeleteAllUserRefreshTokens(ctx context.Context, userID model.UserID) error
		CleanupExpiredTokens(ctx context.Context) error
	}

	TokenService interface {
		GenerateToken(userID model.UserID, isAdmin bool) (string, error)
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
func (s *PokerService) CreateExercise(ctx context.Context, userID model.UserID, isAdmin bool, exercise *model.Exercise) (*model.Exercise, error) {
	// Проверка: только админ может создавать общие задачи
	if exercise.IsCommon && !isAdmin {
		return nil, errors.New("only admin can create common exercises")
	}
	return s.repository.CreateExercise(ctx, userID, isAdmin, exercise)
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

func (s *PokerService) UpdateExercise(ctx context.Context, userID model.UserID, isAdmin bool, exerciseID int64, exercise *model.Exercise) (*model.Exercise, error) {
	existingExercise, err := s.repository.GetExercise(ctx, userID, exerciseID)
	if err != nil {
		return nil, err
	}
	if existingExercise == nil {
		return nil, errors.New("exercise not found")
	}

	if !isAdmin {
		// Нельзя обновлять общую задачу
		if existingExercise.IsCommon {
			return nil, errors.New("only admin can update common exercises")
		}
		// Нельзя менять обычную задачу на общую
		if exercise.IsCommon {
			return nil, errors.New("only admin can set exercise as common")
		}
	}

	return s.repository.UpdateExercise(ctx, userID, isAdmin, exerciseID, exercise)
}

func (s *PokerService) DeleteExercise(ctx context.Context, userID model.UserID, isAdmin bool, exerciseID int64) error {
	// Проверяем, что упражнение принадлежит пользователю
	existingExercise, err := s.repository.GetExercise(ctx, userID, exerciseID)
	if err != nil {
		return err
	}
	if existingExercise == nil {
		return errors.New("exercise not found")
	}

	if !isAdmin && existingExercise.IsCommon {
		return errors.New("only admin can delete common exercises")
	}

	return s.repository.DeleteExercise(ctx, userID, isAdmin, exerciseID)
}

// Методы для категорий
func (s *PokerService) CreateCategory(ctx context.Context, userID model.UserID, isAdmin bool, category *model.Category) (*model.Category, error) {
	if category.IsCommon && !isAdmin {
		return nil, errors.New("only admin can create common categories")
	}
	return s.repository.CreateCategory(ctx, userID, isAdmin, category)
}

func (s *PokerService) GetCategories(ctx context.Context, userID model.UserID) (model.CategoryListResponse, error) {
	categories, total, err := s.repository.GetCategories(ctx, userID)
	if err != nil {
		return model.CategoryListResponse{}, err
	}

	return model.CategoryListResponse{
		Categories: categories,
		Total:      total,
		Page:       1,
		PageSize:   total,
		HasNext:    false,
		HasPrev:    false,
	}, nil
}

func (s *PokerService) GetCategory(ctx context.Context, userID model.UserID, categoryID int64) (*model.Category, error) {
	return s.repository.GetCategory(ctx, userID, categoryID)
}

func (s *PokerService) UpdateCategory(ctx context.Context, userID model.UserID, isAdmin bool, categoryID int64, category *model.Category) (*model.Category, error) {
	existingCategory, err := s.repository.GetCategory(ctx, userID, categoryID)
	if err != nil {
		return nil, err
	}
	if existingCategory == nil {
		return nil, errors.New("category not found")
	}
	if !isAdmin {
		if existingCategory.IsCommon {
			return nil, errors.New("only admin can update common categories")
		}
		if category.IsCommon {
			return nil, errors.New("only admin can set category as common")
		}
	}
	return s.repository.UpdateCategory(ctx, userID, isAdmin, categoryID, category)
}

func (s *PokerService) DeleteCategory(ctx context.Context, userID model.UserID, isAdmin bool, categoryID int64) error {
	existingCategory, err := s.repository.GetCategory(ctx, userID, categoryID)
	if err != nil {
		return err
	}
	if existingCategory == nil {
		return errors.New("category not found")
	}
	if !isAdmin && existingCategory.IsCommon {
		return errors.New("only admin can delete common categories")
	}
	return s.repository.DeleteCategory(ctx, userID, isAdmin, categoryID)
}

func (s *PokerService) GetExercisesFiltered(ctx context.Context, userID model.UserID, language *string, categoryID int64, page, pageSize int) (*model.ExerciseListWithUserResponse, error) {
	detailseList, total, err := s.repository.GetExercisesFiltered(ctx, userID, language, categoryID, page, pageSize)
	if err != nil {
		return nil, err
	}
	hasNext := (page * pageSize) < total
	hasPrev := page > 1

	return &model.ExerciseListWithUserResponse{
		ExerciseDetailse: detailseList,
		Total:            total,
		Page:             page,
		PageSize:         pageSize,
		HasNext:          hasNext,
		HasPrev:          hasPrev,
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
		ExerciseDetailse: detailseList,
		Total:            total,
		Page:             page,
		PageSize:         pageSize,
		HasNext:          hasNext,
		HasPrev:          hasPrev,
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

func (s *PokerService) GetAllUsers(ctx context.Context) ([]*model.User, error) {
	return s.repository.GetAllUsers(ctx)
}

func (s *PokerService) SetUserAdmin(ctx context.Context, userID model.UserID, isAdmin bool) (*model.User, error) {
	return s.repository.SetUserAdmin(ctx, userID, isAdmin)
}

// Методы для refresh-токенов
func (s *PokerService) CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error {
	return s.repository.CreateRefreshToken(ctx, token)
}

func (s *PokerService) GetRefreshTokenByToken(ctx context.Context, token string) (*model.RefreshToken, error) {
	return s.repository.GetRefreshTokenByToken(ctx, token)
}

func (s *PokerService) RevokeRefreshToken(ctx context.Context, token string) error {
	return s.repository.RevokeRefreshToken(ctx, token)
}

func (s *PokerService) DeleteRefreshTokenByToken(ctx context.Context, token string) error {
	return s.repository.DeleteRefreshTokenByToken(ctx, token)
}

func (s *PokerService) DeleteAllUserRefreshTokens(ctx context.Context, userID model.UserID) error {
	return s.repository.DeleteAllUserRefreshTokens(ctx, userID)
}

func (s *PokerService) CleanupExpiredTokens(ctx context.Context) error {
	return s.repository.CleanupExpiredTokens(ctx)
}
