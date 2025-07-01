-- +goose Up
-- Индексы для таблицы exercises
CREATE INDEX IF NOT EXISTS idx_exercises_user_active ON exercises (user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_user_lang_active ON exercises (user_id, programming_language, is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_user_cat_active ON exercises (user_id, category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_user_diff_active ON exercises (user_id, difficulty, is_active);
CREATE INDEX IF NOT EXISTS idx_exercises_category_active ON exercises (category_id, is_active);

-- Индексы для таблицы exercise_stats
CREATE INDEX IF NOT EXISTS idx_exercise_stats_exercise_id ON exercise_stats (exercise_id);

-- +goose Down
DROP INDEX IF EXISTS idx_exercises_user_active;
DROP INDEX IF EXISTS idx_exercises_user_lang_active;
DROP INDEX IF EXISTS idx_exercises_user_cat_active;
DROP INDEX IF EXISTS idx_exercises_user_diff_active;
DROP INDEX IF EXISTS idx_exercises_category_active;
DROP INDEX IF EXISTS idx_exercise_stats_exercise_id; 