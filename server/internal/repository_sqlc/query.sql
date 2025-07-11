-- name: CreateUser :one
INSERT INTO users (name, is_admin)
VALUES ($1, $2)
returning user_id, name, evaluation_strategy, maximum_score, is_admin;

-- name: UpdateUserName :one
UPDATE users
SET name = $1
WHERE user_id = $2
RETURNING user_id, name, evaluation_strategy, maximum_score, is_admin;

-- name: GetUsersByIDs :many
SELECT user_id, name, evaluation_strategy, maximum_score, is_admin FROM users
WHERE user_id = ANY($1::bigint[]);

-- name: GetUserByID :one
SELECT user_id, name, evaluation_strategy, maximum_score, is_admin FROM users
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
    user_id, title, description, category_id, code_to_remember, created_at, updated_at, is_active, programming_language, is_common
) VALUES (
    $1, $2, $3, $4, $5, NOW(), NOW(), TRUE, $6, $7
) RETURNING id, user_id, title, description, category_id, code_to_remember, created_at, updated_at, is_active, programming_language, is_common;



-- name: CountExercises :one
SELECT COUNT(*) 
FROM exercises as e 
 JOIN categories c 
    ON c.id = e.category_id AND c.is_active = TRUE
WHERE e.user_id = $1 AND is_active = TRUE;

-- name: GetExercise :one
SELECT e.id, e.user_id, e.title, e.description, e.category_id, e.programming_language, e.code_to_remember, e.created_at, e.updated_at, e.is_active, e.is_common
FROM exercises e
WHERE e.id = $1 AND e.is_active = TRUE;

-- name: UpdateExercise :one
UPDATE exercises SET
    title = $1,
    description = $2,
    category_id = $3,
    code_to_remember = $4,
    updated_at = NOW(),
    programming_language = $5,
    is_common = $6
WHERE id = $7
  AND is_active = TRUE
  AND ($9::boolean OR user_id = $8)
RETURNING id, user_id, title, description, category_id, code_to_remember, created_at, updated_at, is_active, programming_language, is_common;

-- name: DeleteExercise :exec
UPDATE exercises SET is_active = FALSE
WHERE id = $1
  AND ($3::boolean OR user_id = $2);

-- name: CreateCategory :one
INSERT INTO categories (
    user_id, name, description, programming_language, color, icon, status, created_at, updated_at, is_active
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), TRUE
) RETURNING *;

-- name: GetCategories :many
SELECT c.id, c.user_id, c.name, c.description, c.programming_language, c.color, c.icon, c.status, c.created_at, c.updated_at, c.is_active, c.is_common
FROM categories c
WHERE c.user_id in ($1, 0)  AND c.is_active = TRUE
ORDER BY c.created_at DESC;

-- name: GetCategoriesByLanguage :many
SELECT * FROM categories
WHERE user_id in ($1, 0)  AND programming_language = $2 AND is_active = TRUE
ORDER BY created_at DESC
LIMIT $3 OFFSET $4;

-- name: CountCategories :one
SELECT COUNT(*) FROM categories WHERE user_id in ($1, 0)  AND is_active = TRUE;

-- name: CountCategoriesByLanguage :one
SELECT COUNT(*) FROM categories WHERE user_id in ($1, 0)  AND programming_language = $2 AND is_active = TRUE;

-- name: GetCategory :one
SELECT c.id, c.user_id, c.name, c.description, c.programming_language, c.color, c.icon, c.status, c.created_at, c.updated_at, c.is_active, c.is_common
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
    is_common = $7,
    updated_at = NOW()
WHERE id = $8
  AND is_active = TRUE
  AND ($10::boolean OR user_id = $9)
RETURNING *;

-- name: DeleteCategory :exec
UPDATE categories SET is_active = FALSE 
WHERE id = $1
  AND ($3::boolean OR user_id = $2);

-- name: CountExercisesByCategory :one
SELECT COUNT(*) 
FROM exercises as e 
 JOIN categories c 
    ON c.id = e.category_id AND c.is_active = TRUE
WHERE e.category_id = $1 AND e.is_active = TRUE;

-- name: GetExercisesFiltered :many
-- $1: user_id, $2: programming_language, $3: category_id, $4: limit, $5: offset
SELECT
  e.id,
  e.user_id,
  e.title,
  e.description,
  e.category_id,
  e.programming_language,
  e.code_to_remember as code_to_remember,
  e.created_at,
  e.updated_at,
  e.is_active,
  e.is_common,
  CASE 
    WHEN ue.exercise_id IS NULL THEN 
      FALSE
    ELSE
      TRUE
  END AS is_user_exercise,

  case 
   WHEN es.successful_attempts > 0 THEN 
   TRUE
   ELSE
   FALSE
   END as is_solved,
     
  c.name as category_name


FROM exercises e
LEFT JOIN user_exercises ue
  ON ue.exercise_id = e.id AND ue.user_id = $1

LEFT JOIN exercise_stats es
  ON es.exercise_id = e.id AND es.user_id = $1

    JOIN categories c 
    ON c.id = e.category_id AND c.is_active = TRUE

WHERE
  e.user_id in ($1, 0) 
  AND e.is_active = TRUE
  AND ($2::varchar  = '' OR e.programming_language = $2)
  AND ($3::bigint = 0 OR e.category_id = $3)
ORDER BY
  e.programming_language ASC,
  e.category_id ASC,
  e.created_at DESC
LIMIT $4 OFFSET $5;

-- name: CountExercisesFiltered :one
-- $1: user_id, $2: programming_language, $3: category_id
SELECT COUNT(*) FROM exercises e
 JOIN categories c 
    ON c.id = e.category_id AND c.is_active = TRUE
WHERE e.user_id in ($1, 0) 
  AND e.is_active = TRUE
  AND ($2::varchar = '' OR e.programming_language = $2)
  AND ($3::bigint = 0 OR e.category_id = $3);

-- name: GetExerciseStat :one
SELECT es.user_id, es.exercise_id, es.total_attempts, es.successful_attempts, es.total_typing_time, es.total_typed_chars, es.created_at, es.updated_at
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
RETURNING  user_id, exercise_id, total_attempts, successful_attempts, total_typing_time, total_typed_chars, created_at, updated_at;

-- name: UpdateExerciseStat :one
UPDATE exercise_stats SET
    total_attempts = $3,
    successful_attempts = $4,
    total_typing_time = $5,
    total_typed_chars = $6,
    updated_at = NOW()
WHERE user_id = $1 AND exercise_id = $2
RETURNING  user_id, exercise_id, total_attempts, successful_attempts, total_typing_time, total_typed_chars, created_at, updated_at;

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


-- name: CountUserExercises :one
SELECT COUNT(*) FROM user_exercises WHERE user_id = $1;

-- name: GetUserExercisesFiltered :many
-- $1: user_id, $2: programming_language, $3: category_id, $4: limit, $5: offset
    SELECT 
        ue.user_id,
        ue.exercise_id,
        ue.completed_at,
        ue.score,
        ue.attempts_count,
   
        e.id as exercise_id,
        e.user_id as exercise_user_id,
        e.title,
        e.description,
        e.category_id,
        c.programming_language,
        e.code_to_remember as code_to_remember,
        e.created_at as created_at,
        e.updated_at as updated_at,
        e.is_active,
        e.is_common,
        TRUE AS is_user_exercise,
        c.name as category_name,

        CASE WHEN es.successful_attempts > 0 THEN TRUE ELSE FALSE END as is_solved
    FROM user_exercises ue
    JOIN exercises e ON e.id = ue.exercise_id AND e.is_active = TRUE
    JOIN categories c ON c.id = e.category_id AND c.is_active = TRUE
    LEFT JOIN exercise_stats es ON es.exercise_id = e.id AND es.user_id = $1
    WHERE 
       ue.user_id = $1
      AND ($2::varchar = '' OR c.programming_language = $2)
      AND ($3::bigint = 0 OR e.category_id = $3)
  
ORDER BY c.programming_language ASC, e.category_id ASC, e.created_at DESC
LIMIT $4 OFFSET $5;

-- name: CountUserExercisesFiltered :one
-- $1: user_id, $2: programming_language, $3: category_id
SELECT COUNT(*) FROM user_exercises ue
    JOIN exercises e ON e.id = ue.exercise_id AND e.is_active = TRUE
 
   JOIN categories c ON c.id = e.category_id
      AND e.is_active = TRUE

WHERE ue.user_id = $1
  AND ($2::varchar = '' OR c.programming_language = $2)
  AND ($3::bigint = 0 OR e.category_id = $3);

-- name: AddUserExercise :exec
INSERT INTO user_exercises (user_id, exercise_id, attempts_count, created_at, updated_at)
VALUES ($1, $2, 0, NOW(), NOW())
ON CONFLICT (user_id, exercise_id) DO NOTHING;

-- name: RemoveUserExercise :exec
DELETE FROM user_exercises 
WHERE user_id = $1 AND exercise_id = $2;

-- name: GetUserExerciseIDs :many
SELECT exercise_id FROM user_exercises WHERE user_id = $1;

-- name: GetAllUsers :many
SELECT user_id, name, evaluation_strategy, maximum_score, is_admin FROM users;

-- name: SetUserAdmin :one
UPDATE users SET is_admin = $2 WHERE user_id = $1 RETURNING user_id, name, evaluation_strategy, maximum_score, is_admin;

