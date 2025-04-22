# Pickle+ Production Environment Setup Guide

**Framework Version**: 5.3  
**Document Version**: 1.0.0  
**Last Updated**: April 22, 2025  

This document outlines the requirements and setup process for the Pickle+ production environment. Following these guidelines will ensure a stable and secure deployment.

## Infrastructure Requirements

### Server Specifications

| Resource | Minimum Requirement | Recommended |
|----------|---------------------|------------|
| CPU      | 2 vCPUs             | 4+ vCPUs   |
| Memory   | 4 GB RAM            | 8+ GB RAM  |
| Storage  | 20 GB SSD           | 40+ GB SSD |
| Network  | 100 Mbps            | 1+ Gbps    |

### Software Requirements

- **Operating System**: Ubuntu 22.04 LTS or later
- **Node.js**: v18.x or later (LTS version recommended)
- **PostgreSQL**: v14.x or later
- **Nginx**: v1.22.x or later (for reverse proxy)
- **Let's Encrypt**: For SSL certificates

## Network Configuration

### Domain Setup

1. Configure DNS A records to point to your production server IP
2. Set up proper CNAME records for any subdomains
3. Configure reverse DNS (PTR) records for email deliverability

### Firewall Setup

Configure your firewall to allow only necessary traffic:

```
# Allow SSH
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Block all other incoming traffic
ufw default deny incoming

# Allow all outgoing traffic
ufw default allow outgoing

# Enable firewall
ufw enable
```

## Database Setup

### PostgreSQL Configuration

1. Install PostgreSQL:
   ```
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. Secure PostgreSQL:
   ```
   sudo passwd postgres
   ```

3. Create database and user:
   ```
   sudo -u postgres psql
   CREATE DATABASE pickle_plus;
   CREATE USER pickle_user WITH ENCRYPTED PASSWORD 'strong_password_here';
   GRANT ALL PRIVILEGES ON DATABASE pickle_plus TO pickle_user;
   \q
   ```

4. Configure PostgreSQL for production:
   ```
   sudo nano /etc/postgresql/14/main/postgresql.conf
   ```

   Update the following settings:
   ```
   max_connections = 100
   shared_buffers = 2GB  # 25% of available RAM
   effective_cache_size = 6GB  # 75% of available RAM
   work_mem = 20MB
   maintenance_work_mem = 512MB
   ```

5. Restart PostgreSQL:
   ```
   sudo systemctl restart postgresql
   ```

## Application Deployment

### Node.js Setup

1. Install Node.js LTS:
   ```
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. Install PM2 for process management:
   ```
   sudo npm install -g pm2
   ```

### Application Configuration

1. Create application directory:
   ```
   sudo mkdir -p /var/www/pickle-plus
   sudo chown -R $USER:$USER /var/www/pickle-plus
   ```

2. Copy application files:
   ```
   cp -r dist/* /var/www/pickle-plus/
   ```

3. Create production environment file:
   ```
   cp .env.template /var/www/pickle-plus/.env
   nano /var/www/pickle-plus/.env
   ```
   
   Update with actual production values.

4. Install production dependencies:
   ```
   cd /var/www/pickle-plus
   npm install --production
   ```

### Process Management

Configure PM2 to manage the application:

```
cd /var/www/pickle-plus
pm2 start index.js --name "pickle-plus" --env production
pm2 startup
pm2 save
```

## Reverse Proxy Setup

### Nginx Configuration

1. Install Nginx:
   ```
   sudo apt install nginx
   ```

2. Configure Nginx as reverse proxy:
   ```
   sudo nano /etc/nginx/sites-available/pickle-plus
   ```
   
   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Enable site and restart Nginx:
   ```
   sudo ln -s /etc/nginx/sites-available/pickle-plus /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### SSL Certificate Setup

1. Install Certbot:
   ```
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain SSL certificate:
   ```
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. Configure auto-renewal:
   ```
   sudo systemctl status certbot.timer
   ```

## Monitoring Setup

### Application Monitoring

1. Configure PM2 monitoring:
   ```
   pm2 install pm2-server-monit
   ```

2. Set up PM2 web dashboard (optional):
   ```
   pm2 install pm2-web
   ```

### Server Monitoring

1. Install and configure node_exporter for Prometheus metrics:
   ```
   wget https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz
   tar xvfz node_exporter-1.3.1.linux-amd64.tar.gz
   sudo cp node_exporter-1.3.1.linux-amd64/node_exporter /usr/local/bin/
   sudo useradd -rs /bin/false node_exporter
   ```

2. Create node_exporter service:
   ```
   sudo nano /etc/systemd/system/node_exporter.service
   ```
   
   Add the following:
   ```
   [Unit]
   Description=Node Exporter
   After=network.target
   
   [Service]
   User=node_exporter
   Group=node_exporter
   Type=simple
   ExecStart=/usr/local/bin/node_exporter
   
   [Install]
   WantedBy=multi-user.target
   ```

3. Start node_exporter:
   ```
   sudo systemctl daemon-reload
   sudo systemctl start node_exporter
   sudo systemctl enable node_exporter
   ```

## Backup Strategy

### Database Backups

1. Create backup script:
   ```
   sudo nano /usr/local/bin/backup-pickle-db.sh
   ```
   
   Add the following:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/postgresql"
   TIMESTAMP=$(date +%Y%m%d%H%M%S)
   mkdir -p $BACKUP_DIR
   
   # Perform backup
   pg_dump -U postgres pickle_plus > $BACKUP_DIR/pickle_plus_$TIMESTAMP.sql
   
   # Compress backup
   gzip $BACKUP_DIR/pickle_plus_$TIMESTAMP.sql
   
   # Remove backups older than 7 days
   find $BACKUP_DIR -type f -name "pickle_plus_*.sql.gz" -mtime +7 -delete
   ```

2. Make script executable:
   ```
   sudo chmod +x /usr/local/bin/backup-pickle-db.sh
   ```

3. Configure cron job:
   ```
   sudo crontab -e
   ```
   
   Add the following to run backups daily at 2 AM:
   ```
   0 2 * * * /usr/local/bin/backup-pickle-db.sh
   ```

### Application Backups

1. Create backup script:
   ```
   sudo nano /usr/local/bin/backup-pickle-app.sh
   ```
   
   Add the following:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/var/backups/pickle-plus"
   TIMESTAMP=$(date +%Y%m%d%H%M%S)
   APP_DIR="/var/www/pickle-plus"
   mkdir -p $BACKUP_DIR
   
   # Backup application files
   tar -czf $BACKUP_DIR/pickle_plus_app_$TIMESTAMP.tar.gz -C $APP_DIR .
   
   # Remove backups older than 7 days
   find $BACKUP_DIR -type f -name "pickle_plus_app_*.tar.gz" -mtime +7 -delete
   ```

2. Make script executable:
   ```
   sudo chmod +x /usr/local/bin/backup-pickle-app.sh
   ```

3. Configure cron job:
   ```
   sudo crontab -e
   ```
   
   Add the following to run backups weekly on Sunday at 3 AM:
   ```
   0 3 * * 0 /usr/local/bin/backup-pickle-app.sh
   ```

## Security Hardening

### SSH Configuration

1. Edit SSH configuration:
   ```
   sudo nano /etc/ssh/sshd_config
   ```
   
   Set these security options:
   ```
   PermitRootLogin no
   PasswordAuthentication no
   X11Forwarding no
   MaxAuthTries 3
   ```

2. Restart SSH:
   ```
   sudo systemctl restart sshd
   ```

### Automatic Security Updates

Configure automatic security updates:

```
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

## Post-Installation Verification

After setting up the production environment, run the verification script:

```
cd /var/www/pickle-plus
node verify.js
```

This will check that all components are functioning correctly.

## Troubleshooting Guide

### Common Issues

1. **Application won't start**: Check the Node.js logs with `pm2 logs pickle-plus`
2. **Database connection issues**: Verify PostgreSQL is running with `sudo systemctl status postgresql`
3. **Nginx errors**: Check Nginx logs with `sudo tail -f /var/log/nginx/error.log`
4. **SSL certificate issues**: Run `sudo certbot --nginx renew --dry-run` to test renewal

### Support Resources

- Documentation: `/var/www/pickle-plus/docs/`
- Logs: Application logs in PM2, Nginx logs in `/var/log/nginx/`
- Monitoring: PM2 dashboard and server metrics

---

**Next Steps After Setup:**
1. Configure team alerting (if applicable)
2. Set up regular security audits
3. Establish a deployment pipeline for future updates