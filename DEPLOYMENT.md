# 🚀 Mentora — Deployment Guide

## Prerequisites

- Docker & Docker Compose v2+
- A Linux VPS (DigitalOcean, AWS EC2, Hetzner, etc.)
- Domain name (optional but recommended for HTTPS)

---

## 1. First-Time Setup

### Clone the repository
```bash
git clone https://github.com/Sakib-Hasan3/Mentora---An-AI-Based-Mental-Health-Self-Awareness.git
cd Mentora---An-AI-Based-Mental-Health-Self-Awareness
```

### Configure environment
```bash
# Backend
cp backend/.env.example backend/.env
nano backend/.env   # Fill in all required values
```

> [!IMPORTANT]
> Generate a strong SECRET_KEY before deploying:
> ```bash
> python3 -c "import secrets; print(secrets.token_hex(32))"
> ```
> Paste the output as `SECRET_KEY` in `backend/.env`.

### Required `.env` values for production
```env
ENV=production
SECRET_KEY=<your-32-char-hex-key>
MONGODB_URL=mongodb://mentora_admin:strongpassword@mongo:27017/mentora_db?authSource=admin
DATABASE_NAME=mentora_db
GROQ_API_KEY=<your-key>
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
SSLCOMMERZ_IS_SANDBOX=False
PAYMENT_MOCK_MODE=False
```

---

## 2. Build & Run (Docker Compose)

### Development
```bash
docker compose up --build
```
> Frontend: http://localhost:3000 | Backend: http://localhost:8000 | Docs: http://localhost:8000/docs

### Production
```bash
# Build and start all services in background
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## 3. HTTPS with Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot

# Get certificate (standalone mode)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

Then update `nginx/nginx.conf`:
```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

Auto-renew:
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 4. Without Docker (Manual)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Production run
gunicorn main:app \
  --worker-class uvicorn.workers.UvicornWorker \
  --workers 2 \
  --bind 0.0.0.0:8000 \
  --timeout 120

# Development run
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm ci
npm run build           # Production build → ./build/
# Serve ./build/ with Nginx or any static file server
```

---

## 5. Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "database": "connected", ...}
```

---

## 6. Updating the Application

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build --no-deps backend frontend
```

---

## 7. Backup MongoDB

```bash
# Backup
docker exec mentora-mongo mongodump \
  --authenticationDatabase admin \
  -u mentora_admin -p yourpassword \
  --db mentora_db --out /tmp/backup

docker cp mentora-mongo:/tmp/backup ./backups/$(date +%Y%m%d)

# Restore
docker exec -i mentora-mongo mongorestore \
  --authenticationDatabase admin \
  -u mentora_admin -p yourpassword \
  --db mentora_db ./backups/YYYYMMDD/mentora_db
```

---

## 8. Common Issues

| Issue | Solution |
|-------|----------|
| `502 Bad Gateway` | Check backend is running: `docker logs mentora-backend` |
| `MongoDB connection failed` | Verify `MONGODB_URL` and MongoDB container is healthy |
| `CORS error` | Add your frontend domain to `FRONTEND_URL` in `.env` |
| `JWT decode failed` | `SECRET_KEY` changed — users must log in again |
| Payment not working | Set `SSLCOMMERZ_IS_SANDBOX=False` and verify credentials |

---

## 9. Environment Summary

| Service | Dev Port | Prod Access |
|---------|----------|-------------|
| Frontend | :3000 | via Nginx (port 80/443) |
| Backend API | :8000 | via Nginx `/api/` |
| MongoDB | :27017 | Internal only (not exposed) |
| Nginx | - | :80 / :443 |
