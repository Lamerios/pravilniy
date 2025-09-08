#!/bin/bash
# ===================================================================
# Quiz Game - SSL Certificate Renewal Script
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
LOG_FILE="/var/log/ssl-renewal.log"
DOMAIN=""
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1" >> "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

# Check if certificate needs renewal
check_renewal_needed() {
    local cert_file="$SSL_DIR/cert.pem"

    if [[ ! -f "$cert_file" ]]; then
        error "Certificate file not found: $cert_file"
        return 1
    fi

    # Get certificate expiration date
    local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s)
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))

    log "Certificate expires in $days_until_expiry days"

    # Renew if certificate expires in less than 30 days
    if [[ $days_until_expiry -lt 30 ]]; then
        log "Certificate needs renewal (expires in $days_until_expiry days)"
        return 0
    else
        log "Certificate does not need renewal (expires in $days_until_expiry days)"
        return 1
    fi
}

# Renew Let's Encrypt certificate
renew_certificate() {
    log "Starting certificate renewal process..."

    # Check if certbot is available
    if ! command -v certbot > /dev/null 2>&1; then
        error "Certbot is not installed"
        return 1
    fi

    # Stop nginx to free port 80
    log "Stopping nginx for certificate renewal..."
    if systemctl is-active --quiet nginx; then
        systemctl stop nginx
    fi

    # Renew certificate
    if certbot renew --quiet --standalone; then
        success "Certificate renewed successfully"
    else
        error "Certificate renewal failed"
        return 1
    fi

    # Start nginx
    log "Starting nginx..."
    if systemctl is-active --quiet nginx; then
        systemctl start nginx
    fi
}

# Copy renewed certificate
copy_certificate() {
    local domain="$1"
    local certbot_live_dir="/etc/letsencrypt/live/$domain"

    log "Copying renewed certificate..."

    # Check if Let's Encrypt certificate exists
    if [[ ! -f "$certbot_live_dir/fullchain.pem" ]] || [[ ! -f "$certbot_live_dir/privkey.pem" ]]; then
        error "Let's Encrypt certificate files not found"
        return 1
    fi

    # Create backup of current certificate
    if [[ -f "$SSL_DIR/cert.pem" ]]; then
        cp "$SSL_DIR/cert.pem" "$SSL_DIR/cert.pem.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$SSL_DIR/key.pem" "$SSL_DIR/key.pem.backup.$(date +%Y%m%d_%H%M%S)"
        log "Backup of current certificate created"
    fi

    # Copy new certificate
    cp "$certbot_live_dir/fullchain.pem" "$SSL_DIR/cert.pem"
    cp "$certbot_live_dir/privkey.pem" "$SSL_DIR/key.pem"

    # Set proper permissions
    chmod 644 "$SSL_DIR/cert.pem"
    chmod 600 "$SSL_DIR/key.pem"

    success "Certificate copied successfully"
}

# Reload nginx configuration
reload_nginx() {
    log "Reloading nginx configuration..."

    # Check if nginx is running in Docker
    if docker-compose -f "$COMPOSE_FILE" ps nginx | grep -q "Up"; then
        log "Reloading nginx in Docker container..."
        docker-compose -f "$COMPOSE_FILE" exec nginx nginx -s reload
    elif systemctl is-active --quiet nginx; then
        log "Reloading system nginx..."
        systemctl reload nginx
    else
        warn "Nginx is not running, starting nginx..."
        if docker-compose -f "$COMPOSE_FILE" ps nginx | grep -q "Exit"; then
            docker-compose -f "$COMPOSE_FILE" up -d nginx
        else
            systemctl start nginx
        fi
    fi

    success "Nginx configuration reloaded"
}

# Verify certificate
verify_certificate() {
    local cert_file="$SSL_DIR/cert.pem"

    log "Verifying renewed certificate..."

    # Check certificate validity
    if openssl x509 -in "$cert_file" -text -noout > /dev/null 2>&1; then
        success "Certificate is valid"

        # Show certificate details
        local expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
        log "Certificate expires: $expiry_date"
    else
        error "Certificate verification failed"
        return 1
    fi
}

# Test SSL connection
test_ssl_connection() {
    local domain="$1"

    log "Testing SSL connection..."

    # Wait for nginx to start
    sleep 5

    # Test SSL connection
    if openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null > /dev/null 2>&1; then
        success "SSL connection test passed"
    else
        warn "SSL connection test failed"
        return 1
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old certificate backups..."

    local backup_count=0

    # Remove backups older than 30 days
    while IFS= read -r -d '' file; do
        log "Removing old backup: $(basename "$file")"
        rm "$file"
        ((backup_count++))
    done < <(find "$SSL_DIR" -name "*.backup.*" -type f -mtime +30 -print0)

    if [[ $backup_count -gt 0 ]]; then
        success "Removed $backup_count old backup files"
    else
        log "No old backup files to remove"
    fi
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"

    # This function can be extended to send notifications via:
    # - Email
    # - Slack
    # - Discord
    # - SMS

    log "Notification: $status - $message"
}

# Main renewal function
main() {
    local domain="$1"

    if [[ -z "$domain" ]]; then
        error "Domain is required"
        exit 1
    fi

    DOMAIN="$domain"

    log "Starting SSL certificate renewal for domain: $domain"

    # Check if renewal is needed
    if ! check_renewal_needed; then
        log "Certificate renewal not needed"
        exit 0
    fi

    # Perform renewal
    if renew_certificate; then
        if copy_certificate "$domain"; then
            if reload_nginx; then
                if verify_certificate; then
                    if test_ssl_connection "$domain"; then
                        success "SSL certificate renewal completed successfully"
                        send_notification "SUCCESS" "SSL certificate renewed successfully for $domain"
                        cleanup_backups
                    else
                        error "SSL connection test failed after renewal"
                        send_notification "ERROR" "SSL connection test failed for $domain"
                        exit 1
                    fi
                else
                    error "Certificate verification failed after renewal"
                    send_notification "ERROR" "Certificate verification failed for $domain"
                    exit 1
                fi
            else
                error "Failed to reload nginx after renewal"
                send_notification "ERROR" "Failed to reload nginx for $domain"
                exit 1
            fi
        else
            error "Failed to copy renewed certificate"
            send_notification "ERROR" "Failed to copy certificate for $domain"
            exit 1
        fi
    else
        error "Certificate renewal failed"
        send_notification "ERROR" "Certificate renewal failed for $domain"
        exit 1
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 <domain>"
    echo ""
    echo "Examples:"
    echo "  $0 example.com"
    echo "  $0 quiz-game.com"
    echo ""
    echo "This script:"
    echo "  - Checks if certificate needs renewal (expires in < 30 days)"
    echo "  - Renews Let's Encrypt certificate if needed"
    echo "  - Copies renewed certificate to application directory"
    echo "  - Reloads nginx configuration"
    echo "  - Verifies certificate and tests SSL connection"
    echo "  - Cleans up old certificate backups"
}

# Handle script interruption
cleanup_on_exit() {
    if [[ $? -ne 0 ]]; then
        error "SSL renewal process interrupted"
        send_notification "ERROR" "SSL renewal process interrupted for $DOMAIN"
    fi
}
trap cleanup_on_exit EXIT

# Check if domain is provided
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

# Execute main function
main "$1"
