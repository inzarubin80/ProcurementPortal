-- +goose Up
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    user_agent TEXT,
    ip_address TEXT,
    CONSTRAINT unique_user_token UNIQUE (user_id, token)
);

-- +goose Down
DROP TABLE IF EXISTS refresh_tokens; 