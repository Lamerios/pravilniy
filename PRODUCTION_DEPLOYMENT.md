# 🚀 Production Deployment Guide

> **Quiz Game - Production Deployment Instructions**

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Latest version
- **OpenSSL**: For SSL certificate generation

### Network Requirements
- **Ports**: 80 (HTTP), 443 (HTTPS), 5000 (Backend API)
- **Domain**: Configured DNS pointing to your server
- **SSL Certificate**: Valid SSL certificate for your domain

## 🔧 Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/your-org/quiz-game.git
cd quiz-game
```

### 2. Configure Environment
```bash
# Copy production environment template
cp env.production .env.production

# Edit environment variables
nano .env.production
```

**Important variables to change:**
- `DB_PASSWORD` - Strong database password
- `REDIS_PASSWORD` - Strong Redis password
- `JWT_SECRET` - Random 32+ character string
- `SESSION_SECRET` - Random string
- `CORS_ORIGIN` - Your domain (e.g., https://your-domain.com)

### 3. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/nginx/ssl/key.pem

# Set proper permissions
sudo chmod 644 docker/nginx/ssl/cert.pem
sudo chmod 600 docker/nginx/ssl/key.pem
```

#### Option B: Self-signed (Development only)
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout docker/nginx/ssl/key.pem -out docker/nginx/ssl/cert.pem -days 365 -nodes

# Answer prompts with your domain information
```

### 4. Deploy Application
```bash
# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Run deployment
./scripts/deploy-production.sh
```

### 5. Verify Deployment
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/health
```

## 🔄 Maintenance Operations

### Database Backup
```bash
# Make backup script executable
chmod +x scripts/backup-database.sh

# Create backup
./scripts/backup-database.sh backup

# List available backups
./scripts/backup-database.sh list

# Restore from backup
./scripts/backup-database.sh restore -f ./backups/quiz_game_backup_20240115_120000.sql.gz
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
./scripts/deploy-production.sh
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres
```

### Scale Services
```bash
# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend instances
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

## 🔍 Monitoring

### Health Checks
- **Backend**: `https://your-domain.com/api/health`
- **Frontend**: `https://your-domain.com/health`
- **Database**: Check container logs

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Service status
docker-compose -f docker-compose.prod.yml ps

# Disk usage
df -h
docker system df
```

### Log Monitoring
```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Error logs only
docker-compose -f docker-compose.prod.yml logs --tail=100 | grep ERROR
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Services Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h
```

#### 2. Database Connection Issues
```bash
# Check database container
docker-compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U quiz_user -d quiz_game_prod -c "SELECT 1;"
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in docker/nginx/ssl/cert.pem -text -noout

# Test SSL connection
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

#### 4. High Memory Usage
```bash
# Check memory usage
docker stats

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Scale down if needed
docker-compose -f docker-compose.prod.yml up -d --scale backend=1
```

### Emergency Procedures

#### Stop All Services
```bash
docker-compose -f docker-compose.prod.yml down
```

#### Emergency Rollback
```bash
# Stop current services
docker-compose -f docker-compose.prod.yml down

# Restore from backup
./scripts/backup-database.sh restore -f ./backups/latest-backup.sql.gz

# Start previous version
git checkout previous-stable-tag
./scripts/deploy-production.sh
```

#### Enable Maintenance Mode
```bash
# Create maintenance page
echo "<h1>Maintenance in Progress</h1>" > docker/nginx/maintenance.html

# Update nginx config to serve maintenance page
# (Edit docker/nginx/nginx.conf to redirect all traffic to maintenance.html)

# Reload nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 🔐 Security Checklist

### Pre-deployment
- [ ] Change all default passwords
- [ ] Generate strong JWT secrets
- [ ] Configure SSL certificates
- [ ] Set up firewall rules
- [ ] Enable fail2ban
- [ ] Configure log rotation

### Post-deployment
- [ ] Test all endpoints
- [ ] Verify SSL configuration
- [ ] Check security headers
- [ ] Monitor error logs
- [ ] Set up monitoring alerts
- [ ] Configure automated backups

## 📊 Performance Optimization

### Database Optimization
```bash
# Connect to database
docker-compose -f docker-compose.prod.yml exec postgres psql -U quiz_user -d quiz_game_prod

# Check slow queries
SELECT * FROM slow_queries;

# Analyze table statistics
ANALYZE;
```

### Redis Optimization
```bash
# Check Redis memory usage
docker-compose -f docker-compose.prod.yml exec redis redis-cli info memory

# Check Redis performance
docker-compose -f docker-compose.prod.yml exec redis redis-cli --latency
```

### Nginx Optimization
```bash
# Check nginx status
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Reload nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## 📞 Support

### Logs Location
- **Application logs**: `./logs/`
- **Nginx logs**: `./logs/nginx/`
- **Docker logs**: `docker-compose logs`

### Useful Commands
```bash
# System information
docker system info

# Clean up unused resources
docker system prune -a

# Update all images
docker-compose -f docker-compose.prod.yml pull

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 🎯 Next Steps

1. **Monitoring Setup**: Configure Prometheus + Grafana
2. **Load Testing**: Test system under load
3. **Backup Automation**: Set up automated backups
4. **SSL Renewal**: Configure automatic SSL renewal
5. **Scaling**: Plan for horizontal scaling

---

> 💡 **Tip**: Always test deployments in a staging environment first, and keep backups of your database before any major updates!
