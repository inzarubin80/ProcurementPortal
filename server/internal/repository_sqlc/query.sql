-- name: CreateUser :one
INSERT INTO users (name)
VALUES ($1)
returning user_id;

-- name: UpdateUserName :one
UPDATE users
SET name = $1
WHERE user_id = $2
RETURNING *;

-- name: GetUsersByIDs :many
SELECT * FROM users
WHERE user_id = ANY($1::bigint[]);

-- name: GetUserByID :one
SELECT * FROM users
WHERE user_id = $1;

-- name: GetUserAuthProvidersByProviderUid :one
SELECT * FROM user_auth_providers
WHERE provider_uid = $1 AND provider = $2;

-- name: AddUserAuthProviders :one
INSERT INTO user_auth_providers (user_id, provider_uid, provider, name)
VALUES ($1, $2, $3, $4)
returning *;

-- name: CreateExercise :one
INSERT INTO exercises (
    user_id, title, description, category_id, difficulty, programming_language, code_to_remember, created_at, updated_at, is_active
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), TRUE
) RETURNING *;

-- name: GetExercises :many
SELECT e.id, e.user_id, e.title, e.description, e.category_id, e.difficulty, e.programming_language, e.code_to_remember, e.created_at, e.updated_at, e.is_active,
       es.successful_attempts,
       CASE WHEN ue.user_id IS NULL THEN FALSE ELSE TRUE END AS is_user_exercise
FROM exercises e
LEFT JOIN exercise_stats es ON es.exercise_id = e.id AND es.user_id = $1
LEFT JOIN user_exercises ue ON ue.exercise_id = e.id AND ue.user_id = $1
WHERE e.user_id = $1 AND e.is_active = TRUE
ORDER BY e.programming_language ASC, e.category_id ASC, e.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountExercises :one
SELECT COUNT(*) FROM exercises WHERE user_id = $1 AND is_active = TRUE;

-- name: GetExercise :one
SELECT e.id, e.user_id, e.title, e.description, e.category_id, e.difficulty, e.programming_language, e.code_to_remember, e.created_at, e.updated_at, e.is_active
FROM exercises e
WHERE e.id = $1 AND e.user_id = $2 AND e.is_active = TRUE;

-- name: UpdateExercise :one
UPDATE exercises SET
    title = $1,
    description = $2,
    category_id = $3,
    difficulty = $4,
    programming_language = $5,
    code_to_remember = $6,
    updated_at = NOW()
WHERE id = $7 AND user_id = $8 AND is_active = TRUE
RETURNING *;

-- name: DeleteExercise :exec
UPDATE exercises SET is_active = FALSE WHERE id = $1 AND user_id = $2;

-- name: CreateCategory :one
INSERT INTO categories (
    user_id, name, description, programming_language, color, icon, status, created_at, updated_at, is_active
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), TRUE
) RETURNING *;

-- name: GetCategories :many
SELECT c.id, c.user_id, c.name, c.description, c.programming_language, c.color, c.icon, c.status, c.created_at, c.updated_at, c.is_active
FROM categories c
WHERE c.user_id = $1 AND c.is_active = TRUE
ORDER BY c.created_at DESC
LIMIT $2 OFFSET $3;

-- name: GetCategoriesByLanguage :many
SELECT * FROM categories
WHERE user_id = $1 AND programming_language = $2 AND is_active = TRUE
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: CountCategories :one
SELECT COUNT(*) FROM categories WHERE user_id = $1 AND is_active = TRUE;

-- name: CountCategoriesByLanguage :one
SELECT COUNT(*) FROM categories WHERE user_id = $1 AND programming_language = $2 AND is_active = TRUE;

-- name: GetCategory :one
SELECT c.id, c.user_id, c.name, c.description, c.programming_language, c.color, c.icon, c.status, c.created_at, c.updated_at, c.is_active
FROM categories c
WHERE c.id = $1 AND c.user_id = $2 AND c.is_active = TRUE;

-- name: UpdateCategory :one
UPDATE categories SET
    name = $1,
    description = $2,
    programming_language = $3,
    color = $4,
    icon = $5,
    status = $6,
    updated_at = NOW()
WHERE id = $7 AND user_id = $8 AND is_active = TRUE
RETURNING *;

-- name: DeleteCategory :exec
UPDATE categories SET is_active = FALSE WHERE id = $1 AND user_id = $2;

-- name: CountExercisesByCategory :one
SELECT COUNT(*) FROM exercises WHERE category_id = $1 AND is_active = TRUE;

-- name: GetExercisesFiltered :many
SELECT e.id, e.user_id, e.title, e.description, e.category_id, e.difficulty, e.programming_language, e.code_to_remember, e.created_at, e.updated_at, e.is_active,
       es.successful_attempts,
       CASE WHEN ue.user_id IS NULL THEN FALSE ELSE TRUE END AS is_user_exercise
FROM exercises e
LEFT JOIN exercise_stats es ON es.exercise_id = e.id AND es.user_id = $1
LEFT JOIN user_exercises ue ON ue.exercise_id = e.id AND ue.user_id = $1
WHERE e.user_id = $1
  AND e.is_active = TRUE
  AND ($2::varchar = '' OR e.programming_language = $2)
  AND ($3::uuid IS NULL OR e.category_id = $3)
  AND ($4::varchar = '' OR e.difficulty = $4)
ORDER BY e.programming_language ASC, e.category_id ASC, e.created_at DESC
LIMIT $5 OFFSET $6;

-- name: CountExercisesFiltered :one
SELECT COUNT(*) FROM exercises e
WHERE e.user_id = $1
  AND e.is_active = TRUE
  AND ($2::varchar IS NULL OR e.programming_language = $2)
  AND ($3::uuid IS NULL OR e.category_id = $3)
  AND ($4::varchar IS NULL OR e.difficulty = $4);

-- name: GetExerciseStat :one
SELECT es.id, es.user_id, es.exercise_id, es.total_attempts, es.successful_attempts, es.total_typing_time, es.total_typed_chars, es.created_at, es.updated_at
FROM exercise_stats es WHERE es.user_id = $1 AND es.exercise_id = $2;

-- name: UpsertExerciseStat :one
INSERT INTO exercise_stats (user_id, exercise_id, total_attempts, successful_attempts, total_typing_time, total_typed_chars, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
ON CONFLICT (user_id, exercise_id) DO UPDATE SET
    total_attempts = exercise_stats.total_attempts + EXCLUDED.total_attempts,
    successful_attempts = exercise_stats.successful_attempts + EXCLUDED.successful_attempts,
    total_typing_time = exercise_stats.total_typing_time + EXCLUDED.total_typing_time,
    total_typed_chars = exercise_stats.total_typed_chars + EXCLUDED.total_typed_chars,
    updated_at = NOW()
RETURNING id, user_id, exercise_id, total_attempts, successful_attempts, total_typing_time, total_typed_chars, created_at, updated_at;

-- name: UpdateExerciseStat :one
UPDATE exercise_stats SET
    total_attempts = $3,
    successful_attempts = $4,
    total_typing_time = $5,
    total_typed_chars = $6,
    updated_at = NOW()
WHERE user_id = $1 AND exercise_id = $2
RETURNING id, user_id, exercise_id, total_attempts, successful_attempts, total_typing_time, total_typed_chars, created_at, updated_at;

-- name: GetUserStats :one
SELECT
    $1::bigint as user_id,
    COUNT(DISTINCT es.exercise_id) as total_exercises,
    COUNT(DISTINCT CASE WHEN es.successful_attempts > 0 THEN es.exercise_id END) as completed_exercises,
    CASE WHEN SUM(es.total_attempts) > 0
         THEN ROUND(SUM(es.successful_attempts)::numeric / NULLIF(SUM(es.total_attempts),0) * 100)::int
         ELSE 0
    END as average_score,
    COALESCE(SUM(es.total_attempts), 0)::bigint as total_attempts,
    COALESCE(SUM(es.total_typing_time), 0)::bigint as total_time
FROM exercise_stats es
WHERE es.user_id = $1;

-- name: GetUserExercises :many
SELECT 
    ue.user_id,
    ue.exercise_id,
    ue.completed_at,
    ue.score,
    ue.attempts_count,
    ue.created_at as ue_created_at,
    ue.updated_at as ue_updated_at,
    e.id as exercise_id,
    e.user_id as exercise_user_id,
    e.title,
    e.description,
    e.category_id,
    e.difficulty,
    e.programming_language,
    e.code_to_remember,
    e.created_at as exercise_created_at,
    e.updated_at as exercise_updated_at,
    e.is_active
FROM user_exercises ue
JOIN exercises e 
ON e.id = ue.exercise_id
AND e.is_active = TRUE
WHERE ue.user_id = $1
ORDER BY e.programming_language ASC, e.category_id ASC, e.created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountUserExercises :one
SELECT COUNT(*) FROM user_exercises WHERE user_id = $1;

-- name: GetUserExercisesFiltered :many
SELECT 
    ue.user_id,
    ue.exercise_id,
    ue.completed_at,
    ue.score,
    ue.attempts_count,
    ue.created_at as ue_created_at,
    ue.updated_at as ue_updated_at,
    e.id as exercise_id,
    e.user_id as exercise_user_id,
    e.title,
    e.description,
    e.category_id,
    e.difficulty,
    e.programming_language,
    e.code_to_remember,
    e.created_at as exercise_created_at,
    e.updated_at as exercise_updated_at,
    e.is_active
FROM user_exercises ue
 JOIN exercises e ON e.id = ue.exercise_id
      AND e.is_active = TRUE
WHERE ue.user_id = $1
  AND ($2::varchar = '' OR e.programming_language = $2)
  AND ($3::uuid IS NULL OR e.category_id = $3)
  AND ($4::varchar = '' OR e.difficulty = $4)
ORDER BY e.programming_language ASC, e.category_id ASC, e.created_at DESC
LIMIT $5 OFFSET $6;

-- name: CountUserExercisesFiltered :one
SELECT COUNT(*) FROM user_exercises ue
    JOIN exercises e ON e.id = ue.exercise_id AND e.is_active = TRUE
WHERE ue.user_id = $1
  AND ($2::varchar = '' OR e.programming_language = $2)
  AND ($3::uuid IS NULL OR e.category_id = $3)
  AND ($4::varchar = '' OR e.difficulty = $4);

-- name: AddUserExercise :exec
INSERT INTO user_exercises (user_id, exercise_id, attempts_count, created_at, updated_at)
VALUES ($1, $2, 0, NOW(), NOW())
ON CONFLICT (user_id, exercise_id) DO NOTHING;

-- name: RemoveUserExercise :exec
DELETE FROM user_exercises 
WHERE user_id = $1 AND exercise_id = $2;

