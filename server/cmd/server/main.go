package main

import (
	"context"
	"fmt"
	"inzarubin80/MemCode/internal/app"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

// мое исправление
func main() {

	err := godotenv.Load()
	if err != nil {
		fmt.Println("err godotenv")
	}

	ctx := context.Background()
	options := app.Options{
		//Addr: ":8090",
		Addr: ":8080",
	}

	conf := app.NewConfig(options)

	databaseUrl := os.Getenv("DATABASE_URL")

	cfg, err := pgxpool.ParseConfig(databaseUrl)
	if err != nil {
		panic(err.Error())

	}
	dbConn, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		panic(err.Error())
	}

	server, err := app.NewApp(ctx, conf, dbConn)
	if err != nil {
		panic(err.Error())
	}
	err = server.ListenAndServe()
	if err != nil {
		fmt.Println(err.Error())
	}

}
