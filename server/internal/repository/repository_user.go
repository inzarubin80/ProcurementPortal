package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"inzarubin80/MemCode/internal/model"
	sqlc_repository "inzarubin80/MemCode/internal/repository_sqlc"
)

func (r *Repository) CreateUser(ctx context.Context, userData *model.UserProfileFromProvider) (*model.User, error) {

	reposqlsc := sqlc_repository.New(r.conn)
	params := &sqlc_repository.CreateUserParams{
		Name:    userData.Name,
		IsAdmin: false, // по умолчанию
	}
	user, err := reposqlsc.CreateUser(ctx, params)
	if err != nil {
		return nil, err
	}

	return &model.User{
		ID:      model.UserID(user.UserID),
		Name:    user.Name,
		IsAdmin: user.IsAdmin,
	}, nil
}

func (r *Repository) SetUserName(ctx context.Context, userID model.UserID, name string) error {

	reposqlsc := sqlc_repository.New(r.conn)
	arg := &sqlc_repository.UpdateUserNameParams{
		Name:   name,
		UserID: int64(userID),
	}
	_, err := reposqlsc.UpdateUserName(ctx, arg)

	return err

}

func (r *Repository) GetUser(ctx context.Context, userID model.UserID) (*model.User, error) {

	reposqlsc := sqlc_repository.New(r.conn)
	user, err := reposqlsc.GetUserByID(ctx, int64(userID))

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("%w: %v", model.ErrorNotFound, err)
		}
		return nil, err
	}

	return &model.User{
		ID:      model.UserID(user.UserID),
		Name:    user.Name,
		IsAdmin: user.IsAdmin,
	}, nil

}

func (r *Repository) GetUsersByIDs(ctx context.Context, userIDs []model.UserID) ([]*model.User, error) {

	reposqlsc := sqlc_repository.New(r.conn)
	arg := make([]int64, len(userIDs), len(userIDs))
	for i, value := range userIDs {
		arg[i] = int64(value)
	}

	users, err := reposqlsc.GetUsersByIDs(ctx, arg)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("%w: %v", model.ErrorNotFound, err)
		}
		return nil, err
	}

	usersRes := make([]*model.User, len(users))

	for i, value := range users {
		usersRes[i] = &model.User{
			ID:      model.UserID(value.UserID),
			Name:    value.Name,
			IsAdmin: value.IsAdmin,
		}
	}

	return usersRes, nil

}

func (r *Repository) GetAllUsers(ctx context.Context) ([]*model.User, error) {
	reposqlsc := sqlc_repository.New(r.conn)
	users, err := reposqlsc.GetAllUsers(ctx)
	if err != nil {
		return nil, err
	}
	usersRes := make([]*model.User, len(users))
	for i, value := range users {
		usersRes[i] = &model.User{
			ID:                 model.UserID(value.UserID),
			Name:               value.Name,
			IsAdmin:            value.IsAdmin,
		}
	}
	return usersRes, nil
}

func (r *Repository) SetUserAdmin(ctx context.Context, userID model.UserID, isAdmin bool) (*model.User, error) {
	reposqlsc := sqlc_repository.New(r.conn)
	params := &sqlc_repository.SetUserAdminParams{
		UserID:  int64(userID),
		IsAdmin: isAdmin,
	}
	user, err := reposqlsc.SetUserAdmin(ctx, params)
	if err != nil {
		return nil, err
	}
	return &model.User{
		ID:      model.UserID(user.UserID),
		Name:    user.Name,
		IsAdmin: user.IsAdmin,
	}, nil
}
