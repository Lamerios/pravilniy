# 🚀 Деплой - Enterprise Guide

> **Для**: DevOps, SRE, разработчиков | **Цель**: Production-ready деплой | **Enterprise-scale**

## 🎯 Обзор стратегии деплоя

### Enterprise принципы
- **Zero Downtime Deployment** - без прерывания сервиса
- **Blue-Green Deployment** - мгновенное переключение
- **Automated Rollback** - автоматический откат при проблемах
- **Multi-environment** - dev/staging/prod окружения
- **Infrastructure as Code** - все через код
- **Monitoring & Alerting** - полный контроль

### Архитектура деплоя
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                        │
│                    (nginx/HAProxy)                      │
└─────────────────┬───────────────────┬───────────────────┘
                  │                   │
         ┌────────▼────────┐ ┌────────▼────────┐
         │   Blue Stack    │ │   Green Stack   │
         │                 │ │                 │
         │ Frontend (3x)   │ │ Frontend (3x)   │
         │ Backend (5x)    │ │ Backend (5x)    │
         │ WebSocket (2x)  │ │ WebSocket (2x)  │
         └─────────────────┘ └─────────────────┘
                  │                   │
         ┌────────▼───────────────────▼────────┐
         │           Shared Services           │
         │ PostgreSQL (Primary + Replica)     │
         │ Redis Cluster (3 masters)          │
         │ File Storage (NFS/S3)              │
         └─────────────────────────────────────┘
```

## 🐳 Docker Configuration

### Multi-stage Dockerfile (Backend)
```dockerfile
# quiz-game-backend/Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm ci && npm run build

# Stage 3: Runtime
FROM node:20-alpine AS runtime

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy dependencies and built app
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --chown=nodejs:nodejs package*.json ./

# Create directories for logs and uploads
RUN mkdir -p logs uploads && \
    chown -R nodejs:nodejs logs uploads

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### Multi-stage Dockerfile (Frontend)
```dockerfile
# quiz-game-frontend/Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
ARG VITE_API_URL
ARG VITE_WS_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

RUN npm run build

# Stage 2: Runtime with nginx
FROM nginx:alpine AS runtime

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
# quiz-game-frontend/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging format
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    include /etc/nginx/conf.d/*.conf;
}
```

```nginx
# quiz-game-frontend/default.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security
    server_tokens off;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy (if needed)
    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

## 🏗️ Docker Compose (Production)

### Main Compose File
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Load Balancer
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-lb.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend-blue
      - backend-green
      - frontend-blue
      - frontend-green
    networks:
      - quiz-network
    restart: unless-stopped

  # Backend Services (Blue)
  backend-blue:
    image: quiz-backend:${VERSION:-latest}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres-primary
      - REDIS_HOST=redis-cluster
      - DEPLOYMENT_SLOT=blue
    volumes:
      - uploads:/app/uploads
      - logs:/app/logs
    networks:
      - quiz-network
    depends_on:
      - postgres-primary
      - redis-cluster
    restart: unless-stopped

  # Backend Services (Green)
  backend-green:
    image: quiz-backend:${VERSION:-latest}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres-primary
      - REDIS_HOST=redis-cluster
      - DEPLOYMENT_SLOT=green
    volumes:
      - uploads:/app/uploads
      - logs:/app/logs
    networks:
      - quiz-network
    depends_on:
      - postgres-primary
      - redis-cluster
    restart: unless-stopped

  # Frontend Services (Blue)
  frontend-blue:
    image: quiz-frontend:${VERSION:-latest}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    environment:
      - DEPLOYMENT_SLOT=blue
    networks:
      - quiz-network
    restart: unless-stopped

  # Frontend Services (Green)
  frontend-green:
    image: quiz-frontend:${VERSION:-latest}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M
    environment:
      - DEPLOYMENT_SLOT=green
    networks:
      - quiz-network
    restart: unless-stopped

  # PostgreSQL Primary
  postgres-primary:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_REPLICATION_MODE: master
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: ${REPLICATION_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres/postgresql.conf:/etc/postgresql/postgresql.conf
      - ./postgres/pg_hba.conf:/etc/postgresql/pg_hba.conf
    ports:
      - "5432:5432"
    networks:
      - quiz-network
    restart: unless-stopped
    command: postgres -c config_file=/etc/postgresql/postgresql.conf

  # PostgreSQL Replica
  postgres-replica:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_REPLICATION_MODE: slave
      POSTGRES_REPLICATION_USER: replicator
      POSTGRES_REPLICATION_PASSWORD: ${REPLICATION_PASSWORD}
      POSTGRES_MASTER_SERVICE: postgres-primary
    volumes:
      - postgres-replica-data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    networks:
      - quiz-network
    depends_on:
      - postgres-primary
    restart: unless-stopped

  # Redis Cluster
  redis-cluster:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - quiz-network
    restart: unless-stopped

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - quiz-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources
    networks:
      - quiz-network
    restart: unless-stopped

volumes:
  postgres-data:
    driver: local
  postgres-replica-data:
    driver: local
  redis-data:
    driver: local
  uploads:
    driver: local
  logs:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local

networks:
  quiz-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Complete)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Build and Test
  build-and-test:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: |
        cd quiz-game-backend && npm ci
        cd ../quiz-game-frontend && npm ci

    - name: Run tests
      run: |
        cd quiz-game-backend && npm run test:ci
        cd ../quiz-game-frontend && npm run test:ci

    - name: Generate version
      id: version
      run: |
        if [[ $GITHUB_REF == refs/tags/* ]]; then
          VERSION=${GITHUB_REF#refs/tags/}
        else
          VERSION=${GITHUB_SHA::8}
        fi
        echo "version=$VERSION" >> $GITHUB_OUTPUT

  # Build Docker Images
  build-images:
    needs: build-and-test
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        component: [backend, frontend]
        
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-${{ matrix.component }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=semver,pattern={{version}}
          type=sha,prefix={{branch}}-

    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: ./quiz-game-${{ matrix.component }}
        platforms: linux/amd64,linux/arm64
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
        build-args: |
          VERSION=${{ needs.build-and-test.outputs.version }}

  # Deploy to Staging
  deploy-staging:
    if: github.ref == 'refs/heads/main' || github.event.inputs.environment == 'staging'
    needs: [build-and-test, build-images]
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Deploy to staging
      run: |
        # Deploy to staging environment
        ./scripts/deploy.sh staging ${{ needs.build-and-test.outputs.version }}

    - name: Run smoke tests
      run: |
        ./scripts/smoke-tests.sh https://staging.quiz-game.com

  # Deploy to Production
  deploy-production:
    if: startsWith(github.ref, 'refs/tags/') || github.event.inputs.environment == 'production'
    needs: [build-and-test, build-images, deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Deploy to production (Blue-Green)
      run: |
        # Blue-Green deployment
        ./scripts/blue-green-deploy.sh production ${{ needs.build-and-test.outputs.version }}

    - name: Run production smoke tests
      run: |
        ./scripts/smoke-tests.sh https://quiz-game.com

    - name: Notify team
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  # Rollback capability
  rollback:
    if: failure()
    needs: [deploy-production]
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Rollback deployment
      run: |
        ./scripts/rollback.sh production
```

## 📜 Deployment Scripts

### Blue-Green Deployment Script
```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -euo pipefail

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
HEALTH_CHECK_URL="https://${ENVIRONMENT}.quiz-game.com/api/health"
ROLLBACK_TIMEOUT=300 # 5 minutes

# Check if compose file exists
if [[ ! -f "$PROJECT_ROOT/$COMPOSE_FILE" ]]; then
    error "Compose file $COMPOSE_FILE not found"
    exit 1
fi

# Determine current active slot
get_active_slot() {
    local current_slot
    current_slot=$(docker-compose -f "$COMPOSE_FILE" ps --services | grep backend | head -1 | grep -o 'blue\|green' || echo "blue")
    echo "$current_slot"
}

# Health check function
health_check() {
    local url=$1
    local max_attempts=30
    local attempt=1

    log "Performing health check on $url"
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "$url" > /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 10s..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
    return 1
}

# Database migration
run_migrations() {
    log "Running database migrations..."
    
    docker-compose -f "$COMPOSE_FILE" run --rm backend-${TARGET_SLOT} \
        npm run db:migrate
    
    if [[ $? -eq 0 ]]; then
        success "Database migrations completed"
    else
        error "Database migrations failed"
        return 1
    fi
}

# Main deployment function
deploy() {
    local current_slot target_slot
    current_slot=$(get_active_slot)
    
    if [[ "$current_slot" == "blue" ]]; then
        target_slot="green"
    else
        target_slot="blue"
    fi
    
    TARGET_SLOT=$target_slot
    
    log "Starting Blue-Green deployment"
    log "Current active slot: $current_slot"
    log "Target deployment slot: $target_slot"
    log "Version: $VERSION"
    
    # Step 1: Pull new images
    log "Pulling new images..."
    export VERSION
    docker-compose -f "$COMPOSE_FILE" pull backend-${target_slot} frontend-${target_slot}
    
    # Step 2: Start new services
    log "Starting new services in $target_slot slot..."
    docker-compose -f "$COMPOSE_FILE" up -d backend-${target_slot} frontend-${target_slot}
    
    # Step 3: Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Step 4: Run migrations
    if ! run_migrations; then
        error "Migration failed, rolling back..."
        docker-compose -f "$COMPOSE_FILE" stop backend-${target_slot} frontend-${target_slot}
        return 1
    fi
    
    # Step 5: Health check on new services
    local new_health_url="https://${target_slot}.${ENVIRONMENT}.quiz-game.com/api/health"
    if ! health_check "$new_health_url"; then
        error "Health check failed, rolling back..."
        docker-compose -f "$COMPOSE_FILE" stop backend-${target_slot} frontend-${target_slot}
        return 1
    fi
    
    # Step 6: Switch traffic
    log "Switching traffic to $target_slot slot..."
    ./scripts/switch-traffic.sh "$ENVIRONMENT" "$target_slot"
    
    # Step 7: Final health check
    if ! health_check "$HEALTH_CHECK_URL"; then
        error "Final health check failed, rolling back..."
        ./scripts/switch-traffic.sh "$ENVIRONMENT" "$current_slot"
        docker-compose -f "$COMPOSE_FILE" stop backend-${target_slot} frontend-${target_slot}
        return 1
    fi
    
    # Step 8: Stop old services
    log "Stopping old services in $current_slot slot..."
    docker-compose -f "$COMPOSE_FILE" stop backend-${current_slot} frontend-${current_slot}
    
    # Step 9: Cleanup old images
    log "Cleaning up old images..."
    docker image prune -f
    
    success "Blue-Green deployment completed successfully!"
    success "New active slot: $target_slot"
    
    # Step 10: Send notification
    ./scripts/notify-deployment.sh "$ENVIRONMENT" "$VERSION" "$target_slot" "success"
}

# Rollback function
rollback() {
    local current_slot target_slot
    current_slot=$(get_active_slot)
    
    if [[ "$current_slot" == "blue" ]]; then
        target_slot="green"
    else
        target_slot="blue"
    fi
    
    warn "Rolling back deployment..."
    warn "Current active slot: $current_slot"
    warn "Rolling back to slot: $target_slot"
    
    # Start old services
    docker-compose -f "$COMPOSE_FILE" up -d backend-${target_slot} frontend-${target_slot}
    
    # Switch traffic back
    ./scripts/switch-traffic.sh "$ENVIRONMENT" "$target_slot"
    
    # Health check
    if health_check "$HEALTH_CHECK_URL"; then
        success "Rollback completed successfully"
        ./scripts/notify-deployment.sh "$ENVIRONMENT" "rollback" "$target_slot" "rollback"
    else
        error "Rollback health check failed - manual intervention required"
        exit 1
    fi
}

# Main script execution
main() {
    case "${1:-deploy}" in
        "deploy")
            deploy
            ;;
        "rollback")
            rollback
            ;;
        *)
            error "Usage: $0 {deploy|rollback} [environment] [version]"
            exit 1
            ;;
    esac
}

# Trap for cleanup on script exit
cleanup() {
    log "Cleaning up..."
    # Add any cleanup logic here
}
trap cleanup EXIT

# Execute main function
main "$@"
```

### Traffic Switch Script
```bash
#!/bin/bash
# scripts/switch-traffic.sh

set -euo pipefail

ENVIRONMENT=${1:-staging}
TARGET_SLOT=${2:-blue}

log() {
    echo -e "\033[0;34m[$(date +'%Y-%m-%d %H:%M:%S')]\033[0m $1"
}

# Update nginx configuration to point to new slot
update_nginx_config() {
    local config_file="/etc/nginx/sites-available/${ENVIRONMENT}.quiz-game.com"
    local backup_file="${config_file}.backup.$(date +%s)"
    
    log "Backing up current nginx config to $backup_file"
    cp "$config_file" "$backup_file"
    
    log "Updating nginx config to route traffic to $TARGET_SLOT slot"
    
    # Replace upstream backend references
    sed -i "s/backend-blue/backend-${TARGET_SLOT}/g" "$config_file"
    sed -i "s/backend-green/backend-${TARGET_SLOT}/g" "$config_file"
    sed -i "s/frontend-blue/frontend-${TARGET_SLOT}/g" "$config_file"
    sed -i "s/frontend-green/frontend-${TARGET_SLOT}/g" "$config_file"
    
    # Test nginx configuration
    if nginx -t; then
        log "Nginx configuration test passed"
        
        # Reload nginx
        systemctl reload nginx
        log "Nginx reloaded successfully"
        
        # Verify the change
        sleep 5
        if curl -f -s "https://${ENVIRONMENT}.quiz-game.com/api/health" > /dev/null; then
            log "Traffic switch verified successfully"
        else
            error "Traffic switch verification failed"
            return 1
        fi
    else
        error "Nginx configuration test failed, restoring backup"
        cp "$backup_file" "$config_file"
        return 1
    fi
}

# Update load balancer configuration (if using external LB)
update_load_balancer() {
    # This would contain logic for updating external load balancer
    # e.g., AWS ALB, GCP Load Balancer, etc.
    log "Updating load balancer configuration..."
    
    # Example for AWS ALB using AWS CLI
    if command -v aws &> /dev/null; then
        # Update target group to point to new instances
        aws elbv2 modify-target-group \
            --target-group-arn "$TARGET_GROUP_ARN" \
            --health-check-path "/api/health"
    fi
}

main() {
    log "Switching traffic to $TARGET_SLOT slot in $ENVIRONMENT environment"
    
    if update_nginx_config; then
        log "Traffic switch completed successfully"
    else
        error "Traffic switch failed"
        exit 1
    fi
}

main "$@"
```

## 📊 Monitoring & Alerting

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # Backend services
  - job_name: 'quiz-backend'
    static_configs:
      - targets: ['backend-blue:5000', 'backend-green:5000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # Frontend services
  - job_name: 'quiz-frontend'
    static_configs:
      - targets: ['frontend-blue:80', 'frontend-green:80']
    metrics_path: '/metrics'
    scrape_interval: 30s

  # Database
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-primary:9187', 'postgres-replica:9187']

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-cluster:9121']

  # Node exporter
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Alert Rules
```yaml
# monitoring/rules/alerts.yml
groups:
  - name: quiz-game-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }}s"

      # Database connection issues
      - alert: DatabaseConnectionFailed
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
          description: "Cannot connect to PostgreSQL database"

      # Low disk space
      - alert: LowDiskSpace
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10% on {{ $labels.instance }}"

      # High memory usage
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage"
          description: "Memory usage is above 90% on {{ $labels.instance }}"

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ $labels.job }} service is down on {{ $labels.instance }}"
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Quiz Game - Production Dashboard",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{ method }} {{ status }}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "Active WebSocket Connections",
        "type": "stat",
        "targets": [
          {
            "expr": "websocket_connections_total",
            "legendFormat": "Active Connections"
          }
        ]
      },
      {
        "title": "Database Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(postgres_queries_total[5m])",
            "legendFormat": "Queries/sec"
          }
        ]
      }
    ]
  }
}
```

## 🚨 Incident Response

### Automated Rollback
```bash
#!/bin/bash
# scripts/auto-rollback.sh

# This script is triggered by monitoring alerts
ENVIRONMENT=${1:-production}
REASON=${2:-"health_check_failed"}

log() {
    echo "[$(date)] $1" | tee -a /var/log/quiz-game/rollback.log
}

# Check if rollback is needed
should_rollback() {
    local error_rate health_status
    
    # Check error rate
    error_rate=$(curl -s "http://prometheus:9090/api/v1/query?query=rate(http_requests_total{status=~\"5..\"}[5m])" | jq -r '.data.result[0].value[1]')
    
    # Check health status
    health_status=$(curl -s -o /dev/null -w "%{http_code}" "https://${ENVIRONMENT}.quiz-game.com/api/health")
    
    if [[ $(echo "$error_rate > 0.1" | bc -l) -eq 1 ]] || [[ "$health_status" != "200" ]]; then
        return 0  # Should rollback
    else
        return 1  # Should not rollback
    fi
}

# Perform rollback
perform_rollback() {
    log "Performing automated rollback for $ENVIRONMENT due to: $REASON"
    
    # Execute rollback
    if ./scripts/blue-green-deploy.sh rollback "$ENVIRONMENT"; then
        log "Automated rollback completed successfully"
        
        # Notify team
        ./scripts/notify-deployment.sh "$ENVIRONMENT" "auto-rollback" "previous" "rollback" "$REASON"
        
        return 0
    else
        log "Automated rollback failed - manual intervention required"
        
        # Send critical alert
        ./scripts/send-alert.sh "CRITICAL: Automated rollback failed for $ENVIRONMENT" "$REASON"
        
        return 1
    fi
}

# Main execution
if should_rollback; then
    perform_rollback
else
    log "Rollback not needed - system appears healthy"
fi
```

## 🔧 Operational Commands

### Daily Operations
```bash
# Check deployment status
./scripts/deployment-status.sh production

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend-blue
docker-compose -f docker-compose.prod.yml logs -f frontend-green

# Database operations
./scripts/db-backup.sh production
./scripts/db-restore.sh production backup-20250127.sql

# Scaling services
docker-compose -f docker-compose.prod.yml up -d --scale backend-blue=5

# Health checks
curl https://quiz-game.com/api/health
curl https://quiz-game.com/api/metrics

# Certificate renewal (Let's Encrypt)
certbot renew --nginx

# System maintenance
./scripts/cleanup-old-images.sh
./scripts/optimize-database.sh
```

### Emergency Procedures
```bash
# Emergency stop all services
docker-compose -f docker-compose.prod.yml stop

# Emergency rollback
./scripts/blue-green-deploy.sh rollback production

# Enable maintenance mode
./scripts/maintenance-mode.sh enable

# Disable maintenance mode
./scripts/maintenance-mode.sh disable

# Force restart specific service
docker-compose -f docker-compose.prod.yml restart backend-blue

# Check system resources
./scripts/system-check.sh
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Code review completed and approved
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security scan completed
- [ ] Database migration scripts reviewed
- [ ] Rollback plan documented
- [ ] Monitoring and alerts configured
- [ ] Load testing completed
- [ ] Backup verified

### During deployment
- [ ] Maintenance window announced
- [ ] Blue-green deployment started
- [ ] Database migrations executed
- [ ] Health checks passing
- [ ] Traffic switched successfully
- [ ] Smoke tests completed
- [ ] Performance metrics normal
- [ ] Old services stopped

### Post-deployment
- [ ] Application functionality verified
- [ ] Performance metrics monitored
- [ ] Error rates within acceptable limits
- [ ] User feedback collected
- [ ] Documentation updated
- [ ] Team notified of successful deployment
- [ ] Post-deployment review scheduled

---

## 🔗 Следующие шаги

1. 🚨 [Troubleshooting Guide](./troubleshooting.md)
2. 👥 [Contributing Guide](./contributing.md)
3. 💡 [Cursor Tips](./cursor-tips.md)

---

> 💡 **Enterprise совет**: Автоматизируйте все рутинные операции, настройте мониторинг на всех уровнях и всегда имейте план отката. Надежность системы = надежность бизнеса!
