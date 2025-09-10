#!/bin/bash
# ===================================================================
# Quiz Game - Self-Signed SSL Certificate Generator
# ===================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="localhost"
DAYS=365
SSL_DIR="$(dirname "$0")"
CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/key.pem"
CSR_FILE="$SSL_DIR/cert.csr"
CONFIG_FILE="$SSL_DIR/ssl.conf"

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
    echo "  -d DOMAIN    Domain name (default: localhost)"
    echo "  -n DAYS      Certificate validity in days (default: 365)"
    echo "  -h           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -d localhost"
    echo "  $0 -d quiz-game.local -n 730"
    echo ""
    echo "This script generates a self-signed SSL certificate for development use."
    echo "Browsers will show security warnings for self-signed certificates."
}

# Create SSL configuration file
create_ssl_config() {
    log "Creating SSL configuration file..."

    cat > "$CONFIG_FILE" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=US
ST=Development
L=Development
O=Quiz Game Development
OU=IT Department
CN=$DOMAIN

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
DNS.3 = localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

    success "SSL configuration file created"
}

# Generate private key
generate_private_key() {
    log "Generating private key..."

    if openssl genrsa -out "$KEY_FILE" 2048; then
        success "Private key generated"
    else
        error "Failed to generate private key"
        exit 1
    fi
}

# Generate certificate signing request
generate_csr() {
    log "Generating certificate signing request..."

    if openssl req -new -key "$KEY_FILE" -out "$CSR_FILE" -config "$CONFIG_FILE"; then
        success "Certificate signing request generated"
    else
        error "Failed to generate certificate signing request"
        exit 1
    fi
}

# Generate self-signed certificate
generate_certificate() {
    log "Generating self-signed certificate..."

    if openssl x509 -req -in "$CSR_FILE" -signkey "$KEY_FILE" -out "$CERT_FILE" -days "$DAYS" -extensions v3_req -extfile "$CONFIG_FILE"; then
        success "Self-signed certificate generated"
    else
        error "Failed to generate self-signed certificate"
        exit 1
    fi
}

# Set proper permissions
set_permissions() {
    log "Setting proper file permissions..."

    # Set certificate permissions
    chmod 644 "$CERT_FILE"

    # Set private key permissions (readable only by owner)
    chmod 600 "$KEY_FILE"

    # Set CSR permissions
    chmod 644 "$CSR_FILE"

    # Set config file permissions
    chmod 644 "$CONFIG_FILE"

    success "File permissions set"
}

# Verify certificate
verify_certificate() {
    log "Verifying generated certificate..."

    # Verify certificate
    if openssl x509 -in "$CERT_FILE" -text -noout > /dev/null 2>&1; then
        success "Certificate is valid"
    else
        error "Certificate verification failed"
        exit 1
    fi

    # Verify private key
    if openssl rsa -in "$KEY_FILE" -check -noout > /dev/null 2>&1; then
        success "Private key is valid"
    else
        error "Private key verification failed"
        exit 1
    fi

    # Check if certificate and key match
    local cert_md5=$(openssl x509 -noout -modulus -in "$CERT_FILE" | openssl md5)
    local key_md5=$(openssl rsa -noout -modulus -in "$KEY_FILE" | openssl md5)

    if [[ "$cert_md5" == "$key_md5" ]]; then
        success "Certificate and private key match"
    else
        error "Certificate and private key do not match"
        exit 1
    fi
}

# Show certificate information
show_certificate_info() {
    log "Certificate information:"
    echo "================================"

    # Show certificate details
    openssl x509 -in "$CERT_FILE" -text -noout | grep -E "(Subject:|Issuer:|Not Before|Not After|DNS:|IP Address:)"

    echo "================================"
    log "Certificate files:"
    echo "  Certificate: $CERT_FILE"
    echo "  Private Key: $KEY_FILE"
    echo "  CSR: $CSR_FILE"
    echo "  Config: $CONFIG_FILE"

    # Show file sizes
    echo "================================"
    log "File sizes:"
    ls -lh "$CERT_FILE" "$KEY_FILE" "$CSR_FILE" "$CONFIG_FILE" 2>/dev/null | awk '{print "  " $9 ": " $5}'
}

# Cleanup temporary files
cleanup() {
    log "Cleaning up temporary files..."

    # Remove CSR file (not needed after certificate generation)
    if [[ -f "$CSR_FILE" ]]; then
        rm "$CSR_FILE"
        log "Removed CSR file"
    fi

    # Remove config file (not needed after certificate generation)
    if [[ -f "$CONFIG_FILE" ]]; then
        rm "$CONFIG_FILE"
        log "Removed config file"
    fi

    success "Cleanup completed"
}

# Main function
main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d)
                DOMAIN="$2"
                shift 2
                ;;
            -n)
                DAYS="$2"
                shift 2
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

    log "Starting self-signed certificate generation..."
    log "Domain: $DOMAIN"
    log "Validity: $DAYS days"
    log "Output directory: $SSL_DIR"

    # Check if OpenSSL is available
    if ! command -v openssl > /dev/null 2>&1; then
        error "OpenSSL is not installed. Please install OpenSSL first."
        exit 1
    fi

    # Check if output directory exists
    if [[ ! -d "$SSL_DIR" ]]; then
        error "SSL directory does not exist: $SSL_DIR"
        exit 1
    fi

    # Check if certificate already exists
    if [[ -f "$CERT_FILE" ]] || [[ -f "$KEY_FILE" ]]; then
        warn "Certificate files already exist"
        warn "Certificate: $CERT_FILE"
        warn "Private Key: $KEY_FILE"
        warn "Do you want to overwrite them? (y/N)"

        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "Certificate generation cancelled"
            exit 0
        fi

        # Remove existing files
        rm -f "$CERT_FILE" "$KEY_FILE" "$CSR_FILE" "$CONFIG_FILE"
        log "Existing certificate files removed"
    fi

    # Generate certificate
    create_ssl_config
    generate_private_key
    generate_csr
    generate_certificate
    set_permissions
    verify_certificate
    show_certificate_info
    cleanup

    success "Self-signed certificate generation completed successfully!"

    warn "Important notes:"
    warn "1. This is a self-signed certificate for development use only"
    warn "2. Browsers will show security warnings"
    warn "3. Do not use in production environments"
    warn "4. Certificate expires in $DAYS days"

    log "To use this certificate:"
    log "1. Start your application with SSL enabled"
    log "2. Access https://$DOMAIN"
    log "3. Accept the security warning in your browser"
}

# Execute main function
main "$@"
