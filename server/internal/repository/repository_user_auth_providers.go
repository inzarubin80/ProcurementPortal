package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"inzarubin80/MemCode/internal/model"
	sqlc_repository "inzarubin80/MemCode/internal/repository_sqlc"
)

func (r *Repository) GetUserAuthProvidersByProviderUid(ctx context.Context, ProviderUid string, Provider string) (*model.UserAuthProviders, error) {

	reposqlsc := sqlc_repository.New(r.conn)

	arg := &sqlc_repository.GetUserAuthProvidersByProviderUidParams{
		ProviderUid: ProviderUid,
		Provider:    Provider,
	}

	UserAuthProvider, err := reposqlsc.GetUserAuthProvidersByProviderUid(ctx, arg)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("%w: %v", model.ErrorNotFound, err)
		}
		return nil, err
	}

	return &model.UserAuthProviders{
		UserID:      model.UserID(UserAuthProvider.UserID),
		ProviderUid: UserAuthProvider.ProviderUid,
		Provider:    UserAuthProvider.Provider,
		Name:        *UserAuthProvider.Name,
	}, nil

}

func (r *Repository) AddUserAuthProviders(ctx context.Context, userProfileFromProvide *model.UserProfileFromProvider, userID model.UserID) (*model.UserAuthProviders, error) {

	reposqlsc := sqlc_repository.New(r.conn)

	arg := &sqlc_repository.AddUserAuthProvidersParams{
		UserID:      int64(userID),
		ProviderUid: userProfileFromProvide.ProviderID,
		Provider:    userProfileFromProvide.ProviderName,
		Name:        &userProfileFromProvide.Name,
	}

	UserAuthProvider, err := reposqlsc.AddUserAuthProviders(ctx, arg)

	if err != nil {
		return nil, err
	}

	return &model.UserAuthProviders{
		UserID:      model.UserID(UserAuthProvider.UserID),
		ProviderUid: UserAuthProvider.ProviderUid,
		Provider:    UserAuthProvider.Provider,
		Name:        *UserAuthProvider.Name,
	}, nil

}

func (r *Repository) GetUserAuthProvidersByUserID(ctx context.Context, userID model.UserID) ([]*model.UserAuthProviders, error) {
	reposqlsc := sqlc_repository.New(r.conn)
	rows, err := reposqlsc.GetUserAuthProvidersByUserID(ctx, int64(userID))
	if err != nil {
		return nil, err
	}
	res := make([]*model.UserAuthProviders, 0, len(rows))
	for _, row := range rows {
		name := ""
		if row.Name != nil {
			name = *row.Name
		}
		res = append(res, &model.UserAuthProviders{
			UserID:      model.UserID(row.UserID),
			ProviderUid: row.ProviderUid,
			Provider:    row.Provider,
			Name:        name,
		})
	}
	return res, nil
}
