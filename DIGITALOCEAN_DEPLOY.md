# DigitalOcean Deployment - Step by Step

## Step 1: Create DigitalOcean Account

1. Go to: https://try.digitalocean.com/freetrialoffer/
2. Sign up with email or GitHub
3. Get $200 free credit for 60 days
4. Add payment method (required but won't be charged during trial)

## Step 2: Create SSH Key (if you don't have one)

### On Windows:
```powershell
# Open PowerShell
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
# Press Enter for default location
# Enter passphrase (optional)

# View your public key
cat ~/.ssh/id_rsa.pub
```

### On Mac/Linux:
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
cat ~/.ssh/id_rsa.pub
```

## Step 3: Create Droplet

1. Click **"Create"** → **"Droplets"**

2. **Choose an image**:
   - Ubuntu 22.04 (LTS) x64

3. **Choose a plan**:
   - Shared CPU → Basic
   - Regular SSD
   - **$12/mo** (2 GB RAM, 1 CPU, 50 GB SSD) - Recommended
   - Or $6/mo if budget constrained (may be slow)

4. **Choose datacenter**:
   - Select closest to your users
   - For Korea: Singapore
   - For Global: New York or San Francisco

5. **Authentication**:
   - SSH keys → New SSH Key
   - Paste your public key from Step 2
   - Name it "My Computer"

6. **Finalize**:
   - Hostname: `chat-manage`
   - Click **"Create Droplet"**

7. **Wait 1 minute** for creation

## Step 4: Get Your Server IP

1. In DigitalOcean dashboard, find your droplet
2. Copy the IP address (e.g., 165.232.170.123)

## Step 5: Connect to Your Server

### Windows (PowerShell):
```powershell
ssh root@YOUR_SERVER_IP
```

### Mac/Linux:
```bash
ssh root@YOUR_SERVER_IP
```

Type "yes" when asked about fingerprint.

## Step 6: Run Automated Setup

Once connected, run this single command:

```bash
curl -fsSL https://raw.githubusercontent.com/sth00619/chat_manage/main/setup-vps.sh | bash
```

The script will ask for:
1. **Domain name**: Enter your domain (e.g., example.com)
   - If no domain yet, use: YOUR_SERVER_IP.nip.io
2. **Email**: For SSL certificates
3. **MySQL root password**: Choose a strong password
4. **MySQL user password**: Choose another strong password

## Step 7: Configure API Keys

After setup completes:

```bash
nano /opt/chat_manage/.env.production
```

Add your API keys:
```env
# Add these keys
OPENAI_API_KEY=sk-proj-...your-key...
GOOGLE_CLIENT_ID=...your-id...
GOOGLE_CLIENT_SECRET=...your-secret...
NAVER_CLIENT_ID=...your-id...
NAVER_CLIENT_SECRET=...your-secret...
```

Save: `Ctrl+X`, then `Y`, then `Enter`

## Step 8: Restart Services

```bash
chat-manage restart
```

## Step 9: Set Up Domain (Optional)

### If you have a domain:

1. Go to your domain provider (Namecheap, GoDaddy, etc.)
2. DNS Settings → Add records:
   ```
   Type: A    Name: @     Value: YOUR_SERVER_IP
   Type: A    Name: www   Value: YOUR_SERVER_IP
   ```
3. Wait 5-30 minutes for DNS propagation

### If no domain, use temporary:
Your app is available at: `http://YOUR_SERVER_IP:3000`

## Step 10: Update OAuth Providers

### Google OAuth:
1. Go to: https://console.cloud.google.com/
2. APIs & Services → Credentials → Your OAuth Client
3. Add to Authorized JavaScript origins:
   - `https://yourdomain.com` OR `http://YOUR_SERVER_IP:3000`
4. Add to Authorized redirect URIs:
   - `https://yourdomain.com/api/auth/google/callback` OR
   - `http://YOUR_SERVER_IP:5001/api/auth/google/callback`

### Naver OAuth:
1. Go to: https://developers.naver.com/
2. 내 애플리케이션 → Your App → API 설정
3. 서비스 URL: Your domain or `http://YOUR_SERVER_IP:3000`
4. Callback URL: Your callback URL based on above

## Step 11: Test Your Application

1. Open browser:
   - With domain: `https://yourdomain.com`
   - Without domain: `http://YOUR_SERVER_IP:3000`

2. Test features:
   - Try logging in
   - Test OAuth login
   - Check chat functionality

## Management Commands

```bash
# View status
chat-manage status

# View logs
chat-manage logs

# Restart services
chat-manage restart

# Create backup
chat-manage backup

# Update application
chat-manage update
```

## Monitoring

### Check server resources:
```bash
htop  # CPU and memory usage
df -h  # Disk usage
docker stats  # Container resources
```

### View application logs:
```bash
# All logs
chat-manage logs

# Specific service
docker-compose -f /opt/chat_manage/docker-compose.production.yml logs -f backend
```

## Troubleshooting

### Can't connect via SSH:
- Check IP address is correct
- Ensure SSH key was added to droplet
- Try password authentication if enabled

### Site not loading:
```bash
# Check if services are running
docker ps

# Check nginx logs
docker logs chat-manage-nginx

# Restart everything
chat-manage restart
```

### OAuth not working:
- Verify redirect URLs match exactly
- Check if using http vs https
- Ensure API keys are correct in .env.production

### Database issues:
```bash
# Check MySQL
docker logs chat-manage-mysql

# Connect to MySQL
docker exec -it chat-manage-mysql mysql -u root -p
```

## Backup Your Droplet

### Manual backup:
```bash
chat-manage backup
```

### Automatic backups (DigitalOcean):
1. Go to Droplet → Backups
2. Enable backups ($2/month)
3. Backups taken weekly automatically

## Scaling Your Droplet

If you need more resources:

1. Go to your Droplet → Resize
2. Choose new size (can only increase)
3. Resize (requires 1-2 minutes downtime)

## Cost Management

### Current setup costs:
- Droplet: $12/month
- Backups: $2/month (optional)
- Domain: ~$10/year (optional)
- **Total**: ~$14-15/month

### Free alternatives:
- Use IP instead of domain
- Skip automated backups
- Use $6/month droplet (slower)

## Security Tips

1. **Change SSH port** (optional):
```bash
nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
systemctl restart ssh
```

2. **Create non-root user**:
```bash
adduser myuser
usermod -aG sudo myuser
usermod -aG docker myuser
```

3. **Enable firewall**:
```bash
ufw status  # Should show active
```

## Next Steps

1. ✅ Your app is now live!
2. ✅ Set up monitoring (UptimeRobot)
3. ✅ Configure custom domain
4. ✅ Enable automated backups
5. ✅ Set up email notifications (optional)

## Support

- DigitalOcean Support: https://www.digitalocean.com/support/
- Community: https://www.digitalocean.com/community
- Our GitHub: https://github.com/sth00619/chat_manage/issues