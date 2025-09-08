#!/bin/bash
# ===================================================================
# Quiz Game - Automatic SSL Setup Script
# ===================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SSL_DIR="$PROJECT_ROOT/docker/nginx/ssl"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

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

# Detect environment
detect_environment() {
    log "Detecting environment..."

    # Check if running in production (has domain)
    if [[ -n "${DOMAIN:-}" ]] && [[ "$DOMAIN" != "localhost" ]]; then
        echo "production"
    else
        echo "development"
    fi
}

# Check if SSL certificates exist
check_ssl_certificates() {
    local cert_file="$SSL_DIR/cert.pem"
    local key_file="$SSL_DIR/key.pem"

    if [[ -f "$cert_file" ]] && [[ -f "$key_file" ]]; then
        return 0  # Certificates exist
    else
        return 1  # Certificates don't exist
    fi
}

# Check if certificates are valid
check_certificate_validity() {
    local cert_file="$SSL_DIR/cert.pem"

    if [[ ! -f "$cert_file" ]]; then
        return 1
    fi

    # Check if certificate is valid and not expired
    if openssl x509 -in "$cert_file" -checkend 0 -noout > /dev/null 2>&1; then
        return 0  # Valid
    else
        return 1  # Invalid or expired
    fi
}

# Setup development SSL
setup_development_ssl() {
    log "Setting up development SSL certificates..."

    # Check if self-signed certificate generator exists
    local generator_script="$PROJECT_ROOT/docker/nginx/ssl/generate-self-signed.sh"

    if [[ -f "$generator_script" ]]; then
        log "Using self-signed certificate generator..."
        chmod +x "$generator_script"
        "$generator_script" -d localhost -n 365
    else
        log "Self-signed certificate generator not found, creating manually..."

        # Generate self-signed certificate manually
        openssl req -x509 -newkey rsa:2048 -keyout "$SSL_DIR/key.pem" -out "$SSL_DIR/cert.pem" -days 365 -nodes -subj "/C=US/ST=Development/L=Development/O=Quiz Game/CN=localhost"

        # Set proper permissions
        chmod 644 "$SSL_DIR/cert.pem"
        chmod 600 "$SSL_DIR/key.pem"
    fi

    success "Development SSL certificates created"
}

# Setup production SSL
setup_production_ssl() {
    local domain="${DOMAIN:-}"

    if [[ -z "$domain" ]]; then
        error "DOMAIN environment variable is required for production SSL setup"
        exit 1
    fi

    log "Setting up production SSL certificates for domain: $domain"

    # Check if setup-ssl script exists
    local setup_script="$PROJECT_ROOT/scripts/setup-ssl.sh"

    if [[ -f "$setup_script" ]]; then
        log "Using SSL setup script..."
        chmod +x "$setup_script"

        # Check if email is provided
        local email="${EMAIL:-admin@$domain}"

        "$setup_script" -d "$domain" -e "$email" -p
    else
        error "SSL setup script not found: $setup_script"
        exit 1
    fi

    success "Production SSL certificates created"
}

# Setup certificate renewal
setup_certificate_renewal() {
    local domain="${DOMAIN:-}"

    if [[ -z "$domain" ]] || [[ "$domain" == "localhost" ]]; then
        log "Skipping certificate renewal setup for development environment"
        return 0
    fi

    log "Setting up certificate renewal..."

    # Check if renewal script exists
    local renewal_script="$PROJECT_ROOT/scripts/renew-ssl.sh"

    if [[ -f "$renewal_script" ]]; then
        chmod +x "$renewal_script"

        # Add to crontab for automatic renewal
        local cron_job="0 2 * * * $renewal_script $domain >> /var/log/ssl-renewal.log 2>&1"

        # Check if cron job already exists
        if ! crontab -l 2>/dev/null | grep -q "$renewal_script"; then
            (crontab -l 2>/dev/null; echo "$cron_job") | crontab -
            success "Certificate renewal cron job added"
        else
            log "Certificate renewal cron job already exists"
        fi
    else
        warn "Certificate renewal script not found: $renewal_script"
    fi
}

# Test SSL configuration
test_ssl_configuration() {
    log "Testing SSL configuration..."

    # Check if nginx is running
    if docker-compose -f "$COMPOSE_FILE" ps nginx | grep -q "Up"; then
        log "Nginx is running, testing SSL..."

        # Test SSL connection
        local domain="${DOMAIN:-localhost}"
        local port="443"

        if [[ "$domain" == "localhost" ]]; then
            port="443"
        fi

        # Wait for nginx to be ready
        sleep 5

        if openssl s_client -connect "$domain:$port" -servername "$domain" < /dev/null > /dev/null 2>&1; then
            success "SSL connection test passed"
        else
            warn "SSL connection test failed (this may be normal if services are not fully started)"
        fi
    else
        warn "Nginx is not running, skipping SSL test"
    fi
}

# Show SSL information
show_ssl_info() {
    local cert_file="$SSL_DIR/cert.pem"

    if [[ -f "$cert_file" ]]; then
        log "SSL Certificate Information:"
        echo "================================"

        # Show certificate details
        openssl x509 -in "$cert_file" -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"

        echo "================================"
        log "Certificate files:"
        ls -la "$SSL_DIR"/*.pem 2>/dev/null | awk '{print "  " $9 ": " $5 " (" $6 " " $7 " " $8 ")"}'

        echo "================================"
    else
        warn "No SSL certificate found"
    fi
}

# Main function
main() {
    log "Starting automatic SSL setup..."

    # Detect environment
    local environment=$(detect_environment)
    log "Detected environment: $environment"

    # Check if SSL certificates already exist and are valid
    if check_ssl_certificates && check_certificate_validity; then
        log "Valid SSL certificates already exist"
        show_ssl_info
        return 0
    fi

    # Setup SSL based on environment
    if [[ "$environment" == "production" ]]; then
        setup_production_ssl
        setup_certificate_renewal
    else
        setup_development_ssl
    fi

    # Test SSL configuration
    test_ssl_configuration

    # Show SSL information
    show_ssl_info

    success "SSL setup completed successfully!"

    if [[ "$environment" == "production" ]]; then
        log "Production SSL setup completed"
        log "Certificates will be automatically renewed"
    else
        warn "Development SSL setup completed"
        warn "Browsers will show security warnings for self-signed certificates"
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Environment Variables:"
    echo "  DOMAIN    Domain name for SSL certificate (default: localhost)"
    echo "  EMAIL     Email address for Let's Encrypt (production only)"
    echo ""
    echo "Examples:"
    echo "  # Development (self-signed)"
    echo "  $0"
    echo ""
    echo "  # Production (Let's Encrypt)"
    echo "  DOMAIN=example.com EMAIL=admin@example.com $0"
    echo ""
    echo "This script automatically detects the environment and sets up appropriate SSL certificates."
}

# Handle script interruption
cleanup_on_exit() {
    if [[ $? -ne 0 ]]; then
        error "SSL setup process interrupted"
    fi
}
trap cleanup_on_exit EXIT

# Check for help option
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    show_usage
    exit 0
fi

# Execute main function
main "$@"
