# Environment Setup Guide

## Prerequisites Installation

### Windows

#### 1. Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Choose default settings:
   - Installation directory: `C:\Program Files\PostgreSQL\15`
   - Port: 5432
   - Username: postgres
   - Password: postgres (or your choice)
4. Complete installation
5. PostgreSQL service will start automatically

**Verify Installation:**
```bash
psql --version
```

#### 2. Install Node.js
1. Download from: https://nodejs.org/ (LTS version)
2. Run installer
3. Accept default settings
4. Complete installation

**Verify Installation:**
```bash
node --version
npm --version
```

#### 3. Install Git (Optional)
1. Download from: https://git-scm.com/download/win
2. Run installer
3. Accept default settings

---

### macOS

#### 1. Install PostgreSQL
Using Homebrew:
```bash
brew install postgresql@15
brew services start postgresql@15
```

Or download from: https://www.postgresql.org/download/macosx/

**Verify Installation:**
```bash
psql --version
```

#### 2. Install Node.js
Using Homebrew:
```bash
brew install node
```

Or download from: https://nodejs.org/

**Verify Installation:**
```bash
node --version
npm --version
```

---

### Linux (Ubuntu/Debian)

#### 1. Install PostgreSQL
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Verify Installation:**
```bash
psql --version
```

#### 2. Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
```

**Verify Installation:**
```bash
node --version
npm --version
```

---

## Project Setup

### 1. Clone or Extract Project
```bash
# If using git
git clone <repository-url>
cd project

# Or extract zip file
cd project
```

### 2. Backend Setup

#### Create Environment File
Create `server/.env`:
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/whatsapp_crm
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

**For Production:**
```env
PORT=5000
DB_USER=<production-user>
DB_PASSWORD=<strong-password>
DB_HOST=<production-host>
DB_PORT=5432
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/whatsapp_crm
JWT_SECRET=<generate-strong-random-string>
NODE_ENV=production
```

#### Install Dependencies
```bash
cd server
npm install
```

#### Setup Database
```bash
npm run setup-db
```

**Expected Output:**
```
Conectando a PostgreSQL...
Creando base de datos whatsapp_crm...
✓ Base de datos creada
Conectando a whatsapp_crm...
Ejecutando schema...
✓ Schema ejecutado correctamente
Creando usuario admin...
✓ Usuario admin creado
  Email: admin@crm.local
  Password: admin123
✓ Base de datos configurada correctamente
```

#### Start Backend
```bash
npm run dev
```

**Expected Output:**
```
Server running on port 5000
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd client
npm install
```

#### Start Frontend
```bash
npm run dev
```

**Expected Output:**
```
VITE v4.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## Verify Installation

### 1. Check Backend
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{"status":"ok"}
```

### 2. Check Frontend
Open browser: http://localhost:5173

**Expected:** Login page appears

### 3. Test Login
- Email: admin@crm.local
- Password: admin123

**Expected:** Dashboard loads

---

## Environment Variables Explained

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| DB_USER | PostgreSQL user | postgres |
| DB_PASSWORD | PostgreSQL password | postgres |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DATABASE_URL | Full connection string | postgresql://... |
| JWT_SECRET | Secret for JWT signing | random-string-32+ |
| NODE_ENV | Environment | development/production |

### Frontend (client/src/api.js)

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Change this if backend is on different host/port.

---

## Troubleshooting

### PostgreSQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Check PostgreSQL is running
   - Windows: Services → postgresql
   - Mac: `brew services list`
   - Linux: `sudo systemctl status postgresql`

2. Verify credentials in .env
   - Default: postgres / postgres
   - Check your installation password

3. Verify database exists
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```

**Solutions:**
1. Change PORT in .env
2. Kill process using port:
   - Windows: `netstat -ano | findstr :5000`
   - Mac/Linux: `lsof -ti:5000 | xargs kill -9`

### npm install Fails
```
npm ERR! 404 Not Found
```

**Solutions:**
1. Clear npm cache
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and package-lock.json
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check npm version
   ```bash
   npm --version
   npm install -g npm@latest
   ```

### Frontend Can't Connect to Backend
**Check:**
1. Backend is running on port 5000
2. API_BASE_URL in client/src/api.js is correct
3. CORS is enabled in server/index.js
4. No firewall blocking port 5000

---

## Development Workflow

### Terminal 1: Backend
```bash
cd server
npm run dev
```

### Terminal 2: Frontend
```bash
cd client
npm run dev
```

### Terminal 3: Database (Optional)
```bash
psql -U postgres -d whatsapp_crm
```

---

## Production Deployment

### 1. Build Frontend
```bash
cd client
npm run build
```

Creates `dist/` folder with optimized build.

### 2. Update Environment
```env
NODE_ENV=production
JWT_SECRET=<strong-random-string>
DB_PASSWORD=<strong-password>
```

### 3. Use Process Manager
```bash
npm install -g pm2
pm2 start server/index.js --name "aurora-chat"
pm2 save
pm2 startup
```

### 4. Setup Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Enable HTTPS (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Database Backup

### Backup Database
```bash
pg_dump -U postgres whatsapp_crm > backup.sql
```

### Restore Database
```bash
psql -U postgres whatsapp_crm < backup.sql
```

### Automated Backup (Linux)
```bash
# Create backup script
cat > /home/user/backup.sh << 'EOF'
#!/bin/bash
pg_dump -U postgres whatsapp_crm > /backups/whatsapp_crm_$(date +%Y%m%d_%H%M%S).sql
EOF

# Make executable
chmod +x /home/user/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/user/backup.sh
```

---

## Monitoring

### Check Backend Logs
```bash
# If using pm2
pm2 logs aurora-chat

# If running directly
# Check terminal output
```

### Check Database
```bash
psql -U postgres -d whatsapp_crm
\dt  # List tables
\du  # List users
SELECT COUNT(*) FROM messages;  # Count messages
```

### Check Disk Space
```bash
# Linux/Mac
df -h

# Windows
Get-Volume
```

---

## Security Checklist

- [ ] Change default admin password
- [ ] Update JWT_SECRET to strong random string
- [ ] Update database password
- [ ] Enable HTTPS in production
- [ ] Configure firewall
- [ ] Set up regular backups
- [ ] Monitor error logs
- [ ] Update dependencies regularly
- [ ] Use strong passwords for all users
- [ ] Enable database encryption (optional)

---

## Performance Tuning

### PostgreSQL
```sql
-- Increase shared_buffers (postgresql.conf)
shared_buffers = 256MB

-- Increase work_mem
work_mem = 16MB

-- Increase maintenance_work_mem
maintenance_work_mem = 64MB
```

### Node.js
```bash
# Increase memory limit
node --max-old-space-size=4096 server/index.js
```

### Frontend
```bash
# Build with optimization
npm run build
```

---

## Useful Commands

### Backend
```bash
# Start development
npm run dev

# Start production
npm start

# Setup database
npm run setup-db
```

### Frontend
```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# Connect to database
psql -U postgres -d whatsapp_crm

# List all databases
\l

# List all tables
\dt

# Describe table
\d table_name

# Exit
\q
```

---

## Support

If you encounter issues:
1. Check this guide
2. Review error messages carefully
3. Check browser console (F12)
4. Check server terminal output
5. Review logs in `server/` directory

---

**Last Updated:** March 2026
**Version:** 1.0.0
