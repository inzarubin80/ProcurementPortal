package repository

import (
	"context"
	"sync"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type (

	Repository struct {
		storage Storage
		conn    DBTX
	}

	DBTX interface {
		Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
		Query(context.Context, string, ...interface{}) (pgx.Rows, error)
		QueryRow(context.Context, string, ...interface{}) pgx.Row
	}


	Storage struct {
		mx                  *sync.RWMutex
	}

)

func NewPokerRepository(capacity int, conn DBTX) *Repository {
	return &Repository{
		conn: conn,
	}
}

