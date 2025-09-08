-- ===================================================================
-- Quiz Game - Production Database Initialization
-- ===================================================================
-- Production database setup with optimized settings

-- Create production database user
CREATE USER quiz_user WITH PASSWORD 'CHANGE_THIS_PASSWORD_IN_PRODUCTION';

-- Create production database
CREATE DATABASE quiz_game_prod OWNER quiz_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE quiz_game_prod TO quiz_user;

-- Connect to the production database
\c quiz_game_prod;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO quiz_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quiz_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quiz_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO quiz_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO quiz_user;

-- Production optimizations
-- Enable query logging for monitoring
ALTER SYSTEM SET log_statement = 'mod';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log slow queries > 1s

-- Memory settings for production
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Connection settings
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Security settings
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET password_encryption = scram-sha-256;

-- Reload configuration
SELECT pg_reload_conf();

-- Create extensions for monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create monitoring views
CREATE OR REPLACE VIEW slow_queries AS
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000  -- Queries taking more than 1 second on average
ORDER BY mean_time DESC;

-- Create backup user for automated backups
CREATE USER backup_user WITH PASSWORD 'CHANGE_THIS_BACKUP_PASSWORD';
GRANT CONNECT ON DATABASE quiz_game_prod TO backup_user;
GRANT USAGE ON SCHEMA public TO backup_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backup_user;

-- Log completion
\echo 'Production database initialization completed successfully!'
\echo 'IMPORTANT: Change all default passwords before deploying to production!'
