# 🚀 Deploy Your App NOW - Quick Start

## Option 1: DigitalOcean ($200 Free Credit)

### 1. Create Account & Droplet (5 minutes)
```
1. Go to: https://try.digitalocean.com/freetrialoffer/
2. Sign up → Get $200 credit
3. Create Droplet → Ubuntu 22.04 → $12/mo plan → Create
4. Copy your server IP address
```

### 2. Connect & Deploy (10 minutes)
```bash
# Connect to server
ssh root@YOUR_SERVER_IP

# Run automated setup (single command!)
curl -fsSL https://raw.githubusercontent.com/sth00619/chat_manage/main/setup-vps.sh | bash
```

### 3. Configure (5 minutes)
When prompted, enter:
- Domain: `your-domain.com` (or use `YOUR_IP.nip.io` for testing)
- Email: `your-email@example.com`
- MySQL passwords: Choose strong passwords

### 4. Add API Keys
```bash
nano /opt/chat_manage/.env.production
```
Add your keys:
- OPENAI_API_KEY=sk-proj-m0fpRkx1CPlf...
- GOOGLE_CLIENT_ID=752592984868-plb3s6kun3fr...
- GOOGLE_CLIENT_SECRET=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
- NAVER_CLIENT_ID=DbUDbK_CsLyoubfXd9s2
- NAVER_CLIENT_SECRET=k9hvgStPu2

Save: `Ctrl+X`, `Y`, `Enter`

### 5. Update OAuth URLs

**Google** (https://console.cloud.google.com/):
- JavaScript origins: `https://your-domain.com`
- Redirect URI: `https://your-domain.com/api/auth/google/callback`

**Naver** (https://developers.naver.com/):
- Service URL: `https://your-domain.com`
- Callback: `https://your-domain.com/api/auth/naver/callback`

### 6. Done! 🎉
```bash
chat-manage restart  # Restart services
chat-manage status   # Check status
```

Your app is live at: `https://your-domain.com`

---

## Option 2: Any VPS Provider

### Quick Install Script
Works on any Ubuntu 20.04+ server:

```bash
# SSH to your server
ssh root@your-server-ip

# Run setup
curl -fsSL https://raw.githubusercontent.com/sth00619/chat_manage/main/setup-vps.sh | bash
```

### Manual Installation
```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Clone repository
git clone https://github.com/sth00619/chat_manage.git /opt/chat_manage
cd /opt/chat_manage

# 3. Configure environment
cp .env.production.example .env.production
nano .env.production  # Add your API keys

# 4. Get SSL certificate
docker run -it --rm -p 80:80 \
  certbot/certbot certonly --standalone \
  --email your@email.com --agree-tos \
  -d yourdomain.com

# 5. Deploy
./deploy-production.sh --backup
```

---

## Management Commands

```bash
chat-manage status    # Check if everything is running
chat-manage logs      # View application logs
chat-manage restart   # Restart all services
chat-manage backup    # Create backup
chat-manage update    # Pull latest code and redeploy
```

---

## Test Your Deployment

1. **Frontend**: https://your-domain.com
   - Should see login page
   - Try creating an account

2. **Backend API**: https://your-domain.com/api/health
   - Should return: `{"status":"healthy"}`

3. **OAuth Login**:
   - Test Google login
   - Test Naver login

---

## Troubleshooting

### Services not starting?
```bash
docker-compose -f /opt/chat_manage/docker-compose.production.yml logs
```

### OAuth not working?
- Check redirect URLs match exactly (http vs https)
- Verify API keys in `.env.production`

### Need help?
```bash
# Check logs
chat-manage logs backend
chat-manage logs frontend

# Restart everything
chat-manage restart

# Check resources
htop
docker stats
```

---

## Costs

- **DigitalOcean**: $12/month (or free with credit)
- **Domain**: $10/year (optional)
- **Total**: ~$12-15/month

---

## 🎯 Quick Links

- **Your GitHub**: https://github.com/sth00619/chat_manage
- **DigitalOcean**: https://try.digitalocean.com/freetrialoffer/
- **Google OAuth**: https://console.cloud.google.com/
- **Naver OAuth**: https://developers.naver.com/

---

## ✅ Deployment Checklist

- [ ] Created VPS account
- [ ] Deployed server
- [ ] Ran setup script
- [ ] Added API keys to .env.production
- [ ] Updated OAuth redirect URLs
- [ ] Tested login functionality
- [ ] Set up domain (optional)
- [ ] Enabled backups (optional)

**Time to deploy: ~20 minutes** 🚀