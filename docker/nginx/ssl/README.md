# SSL Certificates for Production

## 📋 Instructions

This directory should contain SSL certificates for production deployment.

### Required Files:
- `cert.pem` - SSL certificate file
- `key.pem` - SSL private key file

### How to obtain SSL certificates:

#### Option 1: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./key.pem
```

#### Option 2: Self-signed (Development only)
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Answer the prompts with your domain information
```

#### Option 3: Commercial Certificate
1. Purchase SSL certificate from a trusted CA
2. Generate CSR (Certificate Signing Request)
3. Submit CSR to CA
4. Download and install the certificate

### Security Notes:
- Never commit real certificates to version control
- Use environment variables for certificate paths in production
- Regularly renew certificates before expiration
- Use strong private keys (RSA 2048+ or ECDSA P-256+)

### File Permissions:
```bash
chmod 600 key.pem
chmod 644 cert.pem
```

### Docker Volume Mount:
The certificates are mounted as read-only volumes in the nginx container:
```yaml
volumes:
  - ./docker/nginx/ssl:/etc/nginx/ssl:ro
```
