#!/bin/bash
# Настройка аутентификации PostgreSQL для внешних подключений

echo "🔧 Setting up PostgreSQL authentication..."

# Копируем кастомный pg_hba.conf
if [ -f /docker-entrypoint-initdb.d/pg_hba.conf ]; then
    echo "📋 Copying custom pg_hba.conf..."
    cp /docker-entrypoint-initdb.d/pg_hba.conf /var/lib/postgresql/data/pg_hba.conf
    chown postgres:postgres /var/lib/postgresql/data/pg_hba.conf
    chmod 600 /var/lib/postgresql/data/pg_hba.conf
    echo "✅ Custom pg_hba.conf applied successfully"
else
    echo "⚠️  Custom pg_hba.conf not found, using default"
fi

echo "🔧 PostgreSQL authentication setup completed"
