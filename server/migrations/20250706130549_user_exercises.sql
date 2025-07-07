-- +goose Up
-- +goose StatementBegin
CREATE TABLE user_exercises (
    user_id BIGINT NOT NULL,
    exercise_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    score INT,
    attempts_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Составной первичный ключ
    PRIMARY KEY (user_id, exercise_id)
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_user_exercises_exercise_id ON user_exercises(exercise_id);
CREATE INDEX idx_user_exercises_completed_at ON user_exercises(completed_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS user_exercises;
-- +goose StatementEnd
