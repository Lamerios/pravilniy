-- Инициализация базы данных Quiz Game (Development)
-- Автоматически выполняется при первом запуске PostgreSQL контейнера

-- Создание расширений
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Создание схемы приложения
CREATE SCHEMA IF NOT EXISTS quiz_app;

-- Установка search_path
ALTER DATABASE quiz_game_dev SET search_path TO quiz_app, public;

-- Создание пользователя для приложения (если не существует)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles 
      WHERE  rolname = 'quiz_app_user') THEN
      
      CREATE ROLE quiz_app_user LOGIN PASSWORD 'app_password';
   END IF;
END
$do$;

-- Предоставление прав
GRANT USAGE ON SCHEMA quiz_app TO quiz_app_user;
GRANT CREATE ON SCHEMA quiz_app TO quiz_app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA quiz_app TO quiz_app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA quiz_app TO quiz_app_user;

-- Установка прав по умолчанию для новых объектов
ALTER DEFAULT PRIVILEGES IN SCHEMA quiz_app 
    GRANT ALL PRIVILEGES ON TABLES TO quiz_app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA quiz_app 
    GRANT ALL PRIVILEGES ON SEQUENCES TO quiz_app_user;

-- Создание таблицы для отслеживания миграций
CREATE TABLE IF NOT EXISTS quiz_app.migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Вставка начальной записи о миграции
INSERT INTO quiz_app.migrations (name) 
VALUES ('001_initial_setup') 
ON CONFLICT (name) DO NOTHING;

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_migrations_name ON quiz_app.migrations(name);
CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON quiz_app.migrations(executed_at);

-- Логирование успешной инициализации
DO $$
BEGIN
    RAISE NOTICE 'Quiz Game database initialized successfully';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Schema: quiz_app created';
    RAISE NOTICE 'Extensions: uuid-ossp, pgcrypto enabled';
END $$;
