-- Схема БД для sqlc

-- Таблица пользователей
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица настроек пользователей
CREATE TABLE user_settings (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    evaluation_strategy VARCHAR(50) NOT NULL DEFAULT 'fibonacci',
    maximum_score INTEGER NOT NULL DEFAULT 13,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица провайдеров аутентификации пользователей
CREATE TABLE user_auth_providers (
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    provider_uid VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, provider_uid, provider)
);

-- Таблица категорий
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    programming_language VARCHAR(50) NOT NULL, -- язык программирования
    color VARCHAR(7), -- hex color code
    icon VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Индексы для категорий
CREATE INDEX idx_categories_user_id_id ON categories(user_id, id);
CREATE INDEX idx_categories_user_id_created_at ON categories(user_id, created_at DESC);
CREATE INDEX idx_categories_user_id_is_active ON categories(user_id, is_active);
CREATE INDEX idx_categories_programming_language ON categories(programming_language);

-- Таблица упражнений
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
    programming_language VARCHAR(20) NOT NULL DEFAULT 'python',
    code_to_remember TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Индексы для упражнений
CREATE INDEX idx_exercises_user_id_id ON exercises(user_id, id);
CREATE INDEX idx_exercises_user_id_created_at ON exercises(user_id, created_at DESC);
CREATE INDEX idx_exercises_user_id_is_active ON exercises(user_id, is_active);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Триггер для обновления updated_at для категорий
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 