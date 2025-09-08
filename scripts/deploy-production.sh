#!/bin/bash
# ===================================================================
# Quiz Game - Production Deployment Script
# ===================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE="env.production"
PROJECT_NAME="quiz-game-prod"

# Logging functions
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

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker and try again."
        exit 1
    fi

    # Check if Docker Compose is available
    if ! command -v docker-compose > /dev/null 2>&1; then
        error "Docker Compose is not installed. Please install Docker Compose and try again."
        exit 1
    fi

    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file $ENV_FILE not found. Please create it from env.example."
        exit 1
    fi

    # Check if compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        error "Compose file $COMPOSE_FILE not found."
        exit 1
    fi

    success "Prerequisites check passed"
}

# Build images
build_images() {
    log "Building Docker images..."

    # Build backend image
    log "Building backend image..."
    docker-compose -f "$COMPOSE_FILE" build backend

    # Build frontend image
    log "Building frontend image..."
    docker-compose -f "$COMPOSE_FILE" build frontend

    success "Images built successfully"
}

# Deploy services
deploy_services() {
    log "Deploying services..."

    # Stop existing services
    log "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans

    # Start services
    log "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d

    success "Services deployed successfully"
}

# Health check
health_check() {
    log "Performing health checks..."

    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"

        # Check backend health
        if curl -f -s http://localhost:5000/api/health > /dev/null; then
            success "Backend health check passed"
        else
            warn "Backend health check failed, retrying in 10s..."
            sleep 10
            ((attempt++))
            continue
        fi

        # Check frontend health
        if curl -f -s http://localhost:80/health > /dev/null; then
            success "Frontend health check passed"
        else
            warn "Frontend health check failed, retrying in 10s..."
            sleep 10
            ((attempt++))
            continue
        fi

        success "All health checks passed"
        return 0
    done

    error "Health checks failed after $max_attempts attempts"
    return 1
}

# Show deployment status
show_status() {
    log "Deployment status:"
    docker-compose -f "$COMPOSE_FILE" ps

    log "Service logs (last 10 lines):"
    echo "=== Backend Logs ==="
    docker-compose -f "$COMPOSE_FILE" logs --tail=10 backend
    echo "=== Frontend Logs ==="
    docker-compose -f "$COMPOSE_FILE" logs --tail=10 frontend
}

# Cleanup old images
cleanup() {
    log "Cleaning up old images..."
    docker image prune -f
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting production deployment..."

    check_prerequisites
    build_images
    deploy_services

    if health_check; then
        success "Production deployment completed successfully!"
        show_status
        cleanup
    else
        error "Deployment failed health checks"
        log "Rolling back..."
        docker-compose -f "$COMPOSE_FILE" down
        exit 1
    fi
}

# Handle script interruption
cleanup_on_exit() {
    if [[ $? -ne 0 ]]; then
        error "Deployment interrupted. Cleaning up..."
        docker-compose -f "$COMPOSE_FILE" down --remove-orphans
    fi
}
trap cleanup_on_exit EXIT

# Execute main function
main "$@"
