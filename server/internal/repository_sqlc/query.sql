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
SELECT * FROM exercises
WHERE user_id = $1 AND is_active = TRUE
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: CountExercises :one
SELECT COUNT(*) FROM exercises WHERE user_id = $1 AND is_active = TRUE;

-- name: GetExercise :one
SELECT * FROM exercises WHERE id = $1 AND user_id = $2 AND is_active = TRUE;

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
SELECT * FROM categories
WHERE user_id = $1 AND is_active = TRUE
ORDER BY created_at DESC
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
SELECT * FROM categories WHERE id = $1 AND user_id = $2 AND is_active = TRUE;

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
SELECT * FROM exercises
WHERE user_id = $1
  AND is_active = TRUE
  AND ($2::varchar IS NULL OR programming_language = $2)
  AND ($3::uuid IS NULL OR category_id = $3)
ORDER BY created_at DESC
LIMIT $4 OFFSET $5;

-- name: CountExercisesFiltered :one
SELECT COUNT(*) FROM exercises
WHERE user_id = $1
  AND is_active = TRUE
  AND ($2::varchar IS NULL OR programming_language = $2)
  AND ($3::uuid IS NULL OR category_id = $3);

