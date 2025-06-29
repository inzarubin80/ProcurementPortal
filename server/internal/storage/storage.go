package storage

import (
	"context"
	"inzarubin80/MemCode/internal/model"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type DB interface {
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
	BeginTx(ctx context.Context, txOptions pgx.TxOptions) (pgx.Tx, error)
}

type Repository interface {

	//User
	GetUserAuthProvidersByProviderUid(ctx context.Context, ProviderUid string, Provider string) (*model.UserAuthProviders, error)
	AddUserAuthProviders(ctx context.Context, userProfileFromProvide *model.UserProfileFromProvider, userID model.UserID) (*model.UserAuthProviders, error)
	CreateUser(ctx context.Context, userData *model.UserProfileFromProvider) (*model.User, error)
	GetUsersByIDs(ctx context.Context, userIDs []model.UserID) ([]*model.User, error)
	SetUserName(ctx context.Context, userID model.UserID, name string) error
	GetUser(ctx context.Context, userID model.UserID) (*model.User, error)
}

type Adapters struct {
	Repository Repository
}

type TransactionProvider interface {
	Transact(ctx context.Context, txFunc func(adapters Adapters) error) error
}
