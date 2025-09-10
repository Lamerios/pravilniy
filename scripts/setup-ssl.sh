#!/bin/bash
# ===================================================================
# Quiz Game - SSL Certificate Setup Script
# ===================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
SSL_DIR="./docker/nginx/ssl"
CERTBOT_DIR="/etc/letsencrypt"
PRODUCTION_MODE=false

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

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d DOMAIN    Domain name for SSL certificate"
    echo "  -e EMAIL     Email address for Let's Encrypt registration"
    echo "  -p           Production mode (use Let's Encrypt)"
    echo "  -s           Self-signed certificate (development only)"
    echo "  -h           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -d example.com -e admin@example.com -p"
    echo "  $0 -d localhost -s"
    echo ""
    echo "Production mode:"
    echo "  - Uses Let's Encrypt for real SSL certificates"
    echo "  - Requires valid domain and email"
    echo "  - Automatically renews certificates"
    echo ""
    echo "Self-signed mode:"
    echo "  - Generates self-signed certificates for development"
    echo "  - No external validation required"
    echo "  - Browser will show security warning"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if running as root for Let's Encrypt
    if [[ "$PRODUCTION_MODE" == true ]] && [[ $EUID -ne 0 ]]; then
        error "Production mode requires root privileges for Let's Encrypt"
        error "Please run with sudo or as root"
        exit 1
    fi

    # Check if domain is provided
    if [[ -z "$DOMAIN" ]]; then
        error "Domain is required. Use -d option."
        exit 1
    fi

    # Check if email is provided for production
    if [[ "$PRODUCTION_MODE" == true ]] && [[ -z "$EMAIL" ]]; then
        error "Email is required for Let's Encrypt. Use -e option."
        exit 1
    fi

    # Check if OpenSSL is installed
    if ! command -v openssl > /dev/null 2>&1; then
        error "OpenSSL is not installed. Please install OpenSSL first."
        exit 1
    fi

    # Check if certbot is installed for production
    if [[ "$PRODUCTION_MODE" == true ]] && ! command -v certbot > /dev/null 2>&1; then
        warn "Certbot is not installed. Installing certbot..."
        install_certbot
    fi

    success "Prerequisites check passed"
}

# Install certbot
install_certbot() {
    log "Installing certbot..."

    if command -v apt-get > /dev/null 2>&1; then
        # Ubuntu/Debian
        apt-get update
        apt-get install -y certbot
    elif command -v yum > /dev/null 2>&1; then
        # CentOS/RHEL
        yum install -y certbot
    elif command -v dnf > /dev/null 2>&1; then
        # Fedora
        dnf install -y certbot
    else
        error "Cannot install certbot automatically. Please install certbot manually."
        exit 1
    fi

    success "Certbot installed successfully"
}

# Create SSL directory
create_ssl_directory() {
    log "Creating SSL directory: $SSL_DIR"

    if [[ ! -d "$SSL_DIR" ]]; then
        mkdir -p "$SSL_DIR"
    fi

    # Set proper permissions
    chmod 755 "$SSL_DIR"

    success "SSL directory created"
}

# Generate self-signed certificate
generate_self_signed() {
    log "Generating self-signed certificate for domain: $DOMAIN"

    local cert_file="$SSL_DIR/cert.pem"
    local key_file="$SSL_DIR/key.pem"

    # Generate private key
    openssl genrsa -out "$key_file" 2048

    # Generate certificate
    openssl req -new -x509 -key "$key_file" -out "$cert_file" -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"

    # Set proper permissions
    chmod 644 "$cert_file"
    chmod 600 "$key_file"

    success "Self-signed certificate generated"
    warn "Browser will show security warning for self-signed certificate"
    warn "This is normal for development environments"
}

# Generate Let's Encrypt certificate
generate_letsencrypt() {
    log "Generating Let's Encrypt certificate for domain: $DOMAIN"

    # Stop nginx if running
    if systemctl is-active --quiet nginx; then
        log "Stopping nginx for certificate generation..."
        systemctl stop nginx
    fi

    # Generate certificate using standalone mode
    certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        --domains "$DOMAIN" \
        --cert-path "$SSL_DIR/cert.pem" \
        --key-path "$SSL_DIR/key.pem" \
        --fullchain-path "$SSL_DIR/fullchain.pem"

    # Copy certificates to our SSL directory
    if [[ -f "$CERTBOT_DIR/live/$DOMAIN/fullchain.pem" ]]; then
        cp "$CERTBOT_DIR/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
        cp "$CERTBOT_DIR/live/$DOMAIN/privkey.pem" "$SSL_DIR/key.pem"

        # Set proper permissions
        chmod 644 "$SSL_DIR/cert.pem"
        chmod 600 "$SSL_DIR/key.pem"

        success "Let's Encrypt certificate generated and copied"
    else
        error "Failed to generate Let's Encrypt certificate"
        exit 1
    fi

    # Start nginx if it was running
    if systemctl is-active --quiet nginx; then
        log "Starting nginx..."
        systemctl start nginx
    fi
}

# Setup certificate renewal
setup_renewal() {
    if [[ "$PRODUCTION_MODE" == true ]]; then
        log "Setting up certificate renewal..."

        # Create renewal script
        cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

SSL_DIR="/path/to/quiz-game/docker/nginx/ssl"
DOMAIN="your-domain.com"

# Renew certificate
certbot renew --quiet

# Copy renewed certificate
if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$SSL_DIR/cert.pem"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$SSL_DIR/key.pem"

    # Reload nginx
    systemctl reload nginx

    echo "$(date): SSL certificate renewed successfully" >> /var/log/ssl-renewal.log
fi
EOF

        # Replace placeholders
        sed -i "s|/path/to/quiz-game|$(pwd)|g" /usr/local/bin/renew-ssl.sh
        sed -i "s|your-domain.com|$DOMAIN|g" /usr/local/bin/renew-ssl.sh

        # Make script executable
        chmod +x /usr/local/bin/renew-ssl.sh

        # Add to crontab for automatic renewal
        (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/renew-ssl.sh") | crontab -

        success "Certificate renewal setup completed"
        log "Certificates will be automatically renewed daily at 2 AM"
    fi
}

# Verify certificate
verify_certificate() {
    log "Verifying SSL certificate..."

    local cert_file="$SSL_DIR/cert.pem"
    local key_file="$SSL_DIR/key.pem"

    # Check if files exist
    if [[ ! -f "$cert_file" ]] || [[ ! -f "$key_file" ]]; then
        error "Certificate files not found"
        exit 1
    fi

    # Verify certificate
    if openssl x509 -in "$cert_file" -text -noout > /dev/null 2>&1; then
        success "Certificate is valid"

        # Show certificate details
        log "Certificate details:"
        openssl x509 -in "$cert_file" -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After)"
    else
        error "Certificate is invalid"
        exit 1
    fi

    # Verify private key
    if openssl rsa -in "$key_file" -check -noout > /dev/null 2>&1; then
        success "Private key is valid"
    else
        error "Private key is invalid"
        exit 1
    fi
}

# Test SSL connection
test_ssl_connection() {
    log "Testing SSL connection..."

    # Wait a moment for services to start
    sleep 5

    # Test connection
    if openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null > /dev/null 2>&1; then
        success "SSL connection test passed"
    else
        warn "SSL connection test failed (this is normal if services are not running)"
    fi
}

# Main function
main() {
    local self_signed=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d)
                DOMAIN="$2"
                shift 2
                ;;
            -e)
                EMAIL="$2"
                shift 2
                ;;
            -p)
                PRODUCTION_MODE=true
                shift
                ;;
            -s)
                self_signed=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    # Validate mode selection
    if [[ "$PRODUCTION_MODE" == true ]] && [[ "$self_signed" == true ]]; then
        error "Cannot use both production and self-signed modes"
        exit 1
    fi

    if [[ "$PRODUCTION_MODE" == false ]] && [[ "$self_signed" == false ]]; then
        error "Please specify either production (-p) or self-signed (-s) mode"
        show_usage
        exit 1
    fi

    log "Starting SSL certificate setup..."
    log "Domain: $DOMAIN"
    log "Mode: $([ "$PRODUCTION_MODE" == true ] && echo "Production (Let's Encrypt)" || echo "Self-signed")"

    check_prerequisites
    create_ssl_directory

    if [[ "$self_signed" == true ]]; then
        generate_self_signed
    else
        generate_letsencrypt
        setup_renewal
    fi

    verify_certificate
    test_ssl_connection

    success "SSL certificate setup completed successfully!"

    if [[ "$self_signed" == true ]]; then
        warn "Remember: Self-signed certificates are for development only"
        warn "Browsers will show security warnings"
    else
        log "Certificate will be automatically renewed"
        log "Next renewal: $(certbot certificates | grep -A 2 "$DOMAIN" | grep "Expiry Date" | cut -d: -f2-)"
    fi
}

# Execute main function
main "$@"
