-- +goose Up
-- +goose StatementBegin
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    programming_language VARCHAR(50) NOT NULL,
    code_to_remember TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Создаем кластерный индекс по user_id и id
CREATE INDEX idx_exercises_user_id_clustered ON exercises(user_id, id);
-- Создаем внешний ключ на категории
ALTER TABLE exercises ADD CONSTRAINT fk_exercises_category_id 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS exercises;
-- +goose StatementEnd 