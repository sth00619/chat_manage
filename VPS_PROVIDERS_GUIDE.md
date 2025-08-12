# VPS Providers Guide - Where to Deploy

## Recommended VPS Providers

### 1. DigitalOcean (Recommended for Beginners)
**Best for**: Easy setup, great documentation
- **Price**: Starting at $6/month
- **Specs**: 1GB RAM, 25GB SSD, 1TB transfer
- **Link**: https://www.digitalocean.com/

**Quick Setup**:
1. Create account with $200 free credit: https://try.digitalocean.com/freetrialoffer/
2. Create Droplet → Choose Ubuntu 22.04
3. Select $12/month plan (2GB RAM recommended)
4. Choose region closest to your users
5. Add your SSH key
6. Create Droplet

**One-Click Deploy**:
```bash
ssh root@your-droplet-ip
curl -fsSL https://raw.githubusercontent.com/sth00619/chat_manage/main/setup-vps.sh | bash
```

### 2. Vultr
**Best for**: Good performance, multiple locations
- **Price**: Starting at $6/month
- **Specs**: 1GB RAM, 25GB SSD, 2TB transfer
- **Link**: https://www.vultr.com/

**Setup Steps**:
1. Sign up with $100 credit: https://www.vultr.com/promo/try100/
2. Deploy New Server → Cloud Compute
3. Choose Ubuntu 22.04 x64
4. Select $12/month plan
5. Deploy Now

### 3. Linode (Now Akamai)
**Best for**: Reliable, good support
- **Price**: Starting at $5/month
- **Specs**: 1GB RAM, 25GB SSD, 1TB transfer
- **Link**: https://www.linode.com/

**Setup**:
1. Create account with $100 credit
2. Create Linode → Ubuntu 22.04 LTS
3. Choose Shared CPU → Nanode 1GB or Linode 2GB
4. Add SSH key and create

### 4. AWS EC2 (Free Tier)
**Best for**: Enterprise, free tier available
- **Price**: Free tier for 12 months, then ~$10/month
- **Specs**: t2.micro - 1GB RAM, 30GB SSD
- **Link**: https://aws.amazon.com/ec2/

**Setup**:
1. Sign up for AWS Free Tier
2. Launch EC2 Instance → Ubuntu Server 22.04
3. Choose t2.micro (free tier)
4. Configure Security Group (ports 22, 80, 443)
5. Create and download key pair
6. Connect via SSH

### 5. Google Cloud Platform
**Best for**: High performance, $300 free credit
- **Price**: Free tier + $300 credit for 90 days
- **Specs**: e2-micro - 1GB RAM, 30GB SSD
- **Link**: https://cloud.google.com/

**Setup**:
1. Create account with $300 credit
2. Compute Engine → Create Instance
3. Choose e2-micro or e2-small
4. Select Ubuntu 22.04 LTS
5. Allow HTTP and HTTPS traffic

### 6. Oracle Cloud (Always Free)
**Best for**: Free forever tier
- **Price**: Free forever
- **Specs**: 1GB RAM, 2 OCPUs, 50GB storage
- **Link**: https://www.oracle.com/cloud/free/

**Note**: Harder to get approved, limited availability

## Minimum Requirements

### For Production:
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 1 vCPU minimum (2 vCPU recommended)
- **Storage**: 20GB minimum
- **OS**: Ubuntu 20.04+ or Debian 11+
- **Network**: 1TB transfer/month minimum

### Estimated Costs:
- **Small** (up to 100 users): $6-12/month
- **Medium** (100-1000 users): $20-40/month
- **Large** (1000+ users): $60+/month

## Quick Deployment Steps

### 1. After Creating VPS:

```bash
# Connect to your server
ssh root@your-server-ip

# Run automated setup
curl -fsSL https://raw.githubusercontent.com/sth00619/chat_manage/main/setup-vps.sh | bash
```

### 2. Manual Setup Alternative:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repository
git clone https://github.com/sth00619/chat_manage.git /opt/chat_manage
cd /opt/chat_manage

# Copy and edit environment
cp .env.production.example .env.production
nano .env.production

# Deploy
./deploy-production.sh
```

## Domain Setup

### 1. Buy Domain:
- **Namecheap**: https://www.namecheap.com/ (~$10/year)
- **Google Domains**: https://domains.google/ (~$12/year)
- **Cloudflare**: https://www.cloudflare.com/products/registrar/ (at cost)

### 2. Point Domain to VPS:
1. Go to domain DNS settings
2. Create A record:
   - Name: `@`
   - Value: `your-vps-ip`
3. Create A record:
   - Name: `www`
   - Value: `your-vps-ip`
4. Wait 5-30 minutes for DNS propagation

### 3. Verify:
```bash
ping yourdomain.com
# Should show your VPS IP
```

## Cost Comparison Table

| Provider | Minimum | Recommended | Free Tier | Best For |
|----------|---------|-------------|-----------|----------|
| DigitalOcean | $6/mo | $12/mo | $200 credit | Beginners |
| Vultr | $6/mo | $12/mo | $100 credit | Performance |
| Linode | $5/mo | $10/mo | $100 credit | Reliability |
| AWS EC2 | Free* | $10/mo | 12 months | Enterprise |
| Google Cloud | Free* | $10/mo | $300 credit | Scale |
| Oracle | Free | Free | Always free | Budget |

*Free tier with limitations

## Security Checklist After Deployment

- [ ] Change default SSH port
- [ ] Disable root SSH login
- [ ] Set up SSH key authentication only
- [ ] Configure firewall (ufw)
- [ ] Install fail2ban
- [ ] Set up regular backups
- [ ] Monitor server resources
- [ ] Keep system updated

## Monitoring Your VPS

### Free Monitoring Tools:
1. **UptimeRobot**: https://uptimerobot.com/ (free for 50 monitors)
2. **Pingdom**: https://www.pingdom.com/ (free trial)
3. **New Relic**: https://newrelic.com/ (free tier available)

### Built-in Monitoring:
```bash
# Check status
chat-manage status

# View logs
chat-manage logs

# Check resources
htop
df -h
docker stats
```

## Support Resources

### VPS Provider Support:
- DigitalOcean Community: https://www.digitalocean.com/community
- Vultr Docs: https://www.vultr.com/docs/
- Linode Guides: https://www.linode.com/docs/
- AWS Documentation: https://docs.aws.amazon.com/

### Application Support:
- GitHub Issues: https://github.com/sth00619/chat_manage/issues
- Check logs: `docker-compose logs -f`
- Monitor: `chat-manage status`