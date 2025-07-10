-- +goose Up
-- +goose StatementBegin
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    evaluation_strategy TEXT,
    maximum_score INT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS users;
-- +goose StatementEnd