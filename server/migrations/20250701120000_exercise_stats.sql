-- +goose Up
CREATE TABLE exercise_stats (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    total_attempts INT NOT NULL DEFAULT 0,
    successful_attempts INT NOT NULL DEFAULT 0,
    total_typing_time BIGINT NOT NULL DEFAULT 0, -- в секундах
    total_typed_chars INT NOT NULL DEFAULT 0, -- всего введённых символов
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);

-- +goose Down
DROP TABLE IF EXISTS exercise_stats; 