# 🔒 SSL Certificate Setup Guide

> **Quiz Game - SSL Certificate Configuration**

## 📋 Overview

This guide covers SSL certificate setup for both development and production environments.

### SSL Options:
- **Development**: Self-signed certificates
- **Production**: Let's Encrypt certificates

---

## 🚀 Quick Start

### Development (Self-signed)
```bash
# Automatic setup
./scripts/ssl-setup-auto.sh

# Manual setup
./docker/nginx/ssl/generate-self-signed.sh -d localhost
```

### Production (Let's Encrypt)
```bash
# Automatic setup
DOMAIN=your-domain.com EMAIL=admin@your-domain.com ./scripts/ssl-setup-auto.sh

# Manual setup
./scripts/setup-ssl.sh -d your-domain.com -e admin@your-domain.com -p
```

---

## 🔧 Manual Setup

### 1. Development SSL (Self-signed)

#### Generate Self-signed Certificate
```bash
# Navigate to SSL directory
cd docker/nginx/ssl

# Make script executable
chmod +x generate-self-signed.sh

# Generate certificate
./generate-self-signed.sh -d localhost -n 365
```

#### Manual Generation
```bash
# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate
openssl req -new -x509 -key key.pem -out cert.pem -days 365 \
  -subj "/C=US/ST=Development/L=Development/O=Quiz Game/CN=localhost"

# Set permissions
chmod 644 cert.pem
chmod 600 key.pem
```

### 2. Production SSL (Let's Encrypt)

#### Prerequisites
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Or on CentOS/RHEL
sudo yum install certbot
```

#### Generate Let's Encrypt Certificate
```bash
# Make script executable
chmod +x scripts/setup-ssl.sh

# Generate certificate
sudo ./scripts/setup-ssl.sh -d your-domain.com -e admin@your-domain.com -p
```

#### Manual Generation
```bash
# Stop nginx
sudo systemctl stop nginx

# Generate certificate
sudo certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email admin@your-domain.com \
  --domains your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/key.pem

# Set permissions
sudo chmod 644 docker/nginx/ssl/cert.pem
sudo chmod 600 docker/nginx/ssl/key.pem

# Start nginx
sudo systemctl start nginx
```

---

## 🔄 Certificate Renewal

### Automatic Renewal (Production)

#### Setup Renewal
```bash
# Make renewal script executable
chmod +x scripts/renew-ssl.sh

# Test renewal
./scripts/renew-ssl.sh your-domain.com

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/scripts/renew-ssl.sh your-domain.com") | crontab -
```

#### Manual Renewal
```bash
# Renew certificate
sudo certbot renew

# Copy renewed certificate
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/key.pem

# Reload nginx
sudo systemctl reload nginx
```

### Development Renewal
```bash
# Regenerate self-signed certificate
./docker/nginx/ssl/generate-self-signed.sh -d localhost -n 365
```

---

## 🔍 Verification

### Check Certificate
```bash
# View certificate details
openssl x509 -in docker/nginx/ssl/cert.pem -text -noout

# Check expiration date
openssl x509 -in docker/nginx/ssl/cert.pem -noout -enddate

# Verify certificate and key match
openssl x509 -noout -modulus -in docker/nginx/ssl/cert.pem | openssl md5
openssl rsa -noout -modulus -in docker/nginx/ssl/key.pem | openssl md5
```

### Test SSL Connection
```bash
# Test SSL connection
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Test with curl
curl -I https://your-domain.com

# Test with browser
# Open https://your-domain.com in browser
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Certificate Generation Fails
```bash
# Check if domain is accessible
ping your-domain.com

# Check if port 80 is open
telnet your-domain.com 80

# Check DNS resolution
nslookup your-domain.com
```

#### 2. Certificate Not Found
```bash
# Check if certificate files exist
ls -la docker/nginx/ssl/

# Check file permissions
ls -la docker/nginx/ssl/*.pem
```

#### 3. SSL Connection Fails
```bash
# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Check nginx logs
docker-compose -f docker-compose.prod.yml logs nginx

# Check if nginx is running
docker-compose -f docker-compose.prod.yml ps nginx
```

#### 4. Certificate Expired
```bash
# Check expiration date
openssl x509 -in docker/nginx/ssl/cert.pem -noout -enddate

# Renew certificate
./scripts/renew-ssl.sh your-domain.com
```

### Error Messages

#### "Certificate not found"
- Ensure certificate files exist in `docker/nginx/ssl/`
- Check file permissions (644 for cert, 600 for key)

#### "SSL connection failed"
- Verify nginx is running
- Check if port 443 is open
- Verify certificate is valid

#### "Let's Encrypt rate limit exceeded"
- Wait before retrying
- Use staging environment for testing

---

## 📁 File Structure

```
docker/nginx/ssl/
├── cert.pem              # SSL certificate
├── key.pem               # Private key
├── README.md             # SSL documentation
└── generate-self-signed.sh # Self-signed generator

scripts/
├── setup-ssl.sh          # SSL setup script
├── renew-ssl.sh          # Certificate renewal
└── ssl-setup-auto.sh     # Automatic setup
```

---

## 🔐 Security Best Practices

### Certificate Security
- Keep private keys secure (600 permissions)
- Use strong key sizes (2048+ bits)
- Regularly renew certificates
- Monitor certificate expiration

### Production Security
- Use Let's Encrypt for production
- Enable HSTS headers
- Use strong cipher suites
- Implement certificate pinning

### Development Security
- Never use self-signed certificates in production
- Accept security warnings in development
- Use different certificates for different environments

---

## 📊 Monitoring

### Certificate Monitoring
```bash
# Check certificate expiration
openssl x509 -in docker/nginx/ssl/cert.pem -noout -enddate

# Monitor renewal logs
tail -f /var/log/ssl-renewal.log

# Check nginx SSL status
docker-compose -f docker-compose.prod.yml exec nginx nginx -T | grep ssl
```

### Automated Monitoring
```bash
# Add to monitoring script
#!/bin/bash
CERT_FILE="docker/nginx/ssl/cert.pem"
EXPIRY_DATE=$(openssl x509 -in "$CERT_FILE" -noout -enddate | cut -d= -f2)
EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_TIMESTAMP=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))

if [[ $DAYS_UNTIL_EXPIRY -lt 30 ]]; then
    echo "WARNING: Certificate expires in $DAYS_UNTIL_EXPIRY days"
    # Send alert
fi
```

---

## 🎯 Next Steps

1. **Test SSL Configuration**: Verify certificates work correctly
2. **Setup Monitoring**: Monitor certificate expiration
3. **Configure Renewal**: Ensure automatic renewal works
4. **Security Headers**: Add security headers to nginx
5. **Performance**: Optimize SSL configuration

---

## 📞 Support

### Useful Commands
```bash
# View certificate details
openssl x509 -in docker/nginx/ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443

# Check nginx SSL configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -T | grep -A 10 -B 10 ssl

# View SSL logs
docker-compose -f docker-compose.prod.yml logs nginx | grep -i ssl
```

### Log Files
- **SSL Renewal**: `/var/log/ssl-renewal.log`
- **Nginx**: `./logs/nginx/`
- **Application**: `./logs/`

---

> 💡 **Tip**: Always test SSL configuration in a staging environment before deploying to production!
