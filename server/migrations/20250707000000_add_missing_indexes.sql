-- +goose Up
-- Индексы для оптимизации JOIN операций в запросах

-- Индексы для exercise_stats для JOIN с exercises
CREATE INDEX IF NOT EXISTS idx_exercise_stats_user_exercise ON exercise_stats (user_id, exercise_id);

-- Индексы для user_exercises для JOIN с exercises
CREATE INDEX IF NOT EXISTS idx_user_exercises_user_exercise ON user_exercises (user_id, exercise_id);

-- Индексы для categories для фильтрации по языку программирования
CREATE INDEX IF NOT EXISTS idx_categories_user_lang_active ON categories (user_id, programming_language, is_active);

-- Индексы для exercises для сортировки
CREATE INDEX IF NOT EXISTS idx_exercises_lang_cat_created ON exercises (programming_language, category_id, created_at DESC) WHERE is_active = TRUE;

-- Индексы для user_exercises для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_user_exercises_user_created ON user_exercises (user_id, created_at DESC);

-- Индексы для фильтрации по языку программирования в user_exercises (через JOIN)
CREATE INDEX IF NOT EXISTS idx_exercises_lang_active ON exercises (programming_language, is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_diff_active ON exercises (difficulty, is_active);

-- +goose Down
DROP INDEX IF EXISTS idx_exercise_stats_user_exercise;
DROP INDEX IF EXISTS idx_user_exercises_user_exercise;
DROP INDEX IF EXISTS idx_categories_user_lang_active;
DROP INDEX IF EXISTS idx_exercises_lang_cat_created;
DROP INDEX IF EXISTS idx_user_exercises_user_created;
DROP INDEX IF EXISTS idx_exercises_lang_active;
DROP INDEX IF EXISTS idx_exercises_diff_active; 