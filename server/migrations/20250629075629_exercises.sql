-- +goose Up
-- +goose StatementBegin
CREATE TABLE exercises (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    programming_language VARCHAR(50) NOT NULL,
    code_to_remember TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Создаем кластерный индекс по user_id и id
CREATE INDEX idx_exercises_user_id_clustered ON exercises(user_id, id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS exercises;
-- +goose StatementEnd 