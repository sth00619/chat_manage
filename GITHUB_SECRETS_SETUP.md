# GitHub Secrets Setup for Automated Deployment

## Required GitHub Secrets

To enable automated deployment via GitHub Actions, you need to set up the following secrets in your GitHub repository:

### 1. Navigate to Your Repository Settings
1. Go to your GitHub repository: `https://github.com/sth00619/chat_manage`
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

### 2. Required Secrets

#### Server Connection Secrets
- **HOST**: Your server's IP address or domain
  ```
  Name: HOST
  Value: your.server.ip.address or yourdomain.com
  ```

- **USERNAME**: SSH username for your server
  ```
  Name: USERNAME
  Value: root (or your SSH username)
  ```

- **PORT**: SSH port (usually 22)
  ```
  Name: PORT
  Value: 22
  ```

- **SSH_KEY**: Your private SSH key for server access
  ```
  Name: SSH_KEY
  Value: -----BEGIN RSA PRIVATE KEY-----
  [Your complete private key content]
  -----END RSA PRIVATE KEY-----
  ```

#### Application Secrets
- **NEXT_PUBLIC_API_URL**: Your production API URL
  ```
  Name: NEXT_PUBLIC_API_URL
  Value: https://yourdomain.com/api
  ```

### 3. Generate SSH Key for GitHub Actions

On your local machine:
```bash
# Generate a new SSH key pair specifically for GitHub Actions
ssh-keygen -t rsa -b 4096 -f github_actions_key -N ""

# This creates two files:
# - github_actions_key (private key - add to GitHub secrets)
# - github_actions_key.pub (public key - add to server)
```

On your server:
```bash
# Add the public key to authorized_keys
cat github_actions_key.pub >> ~/.ssh/authorized_keys
```

### 4. Test GitHub Actions Workflow

After setting up all secrets:

1. Make a small change to your code
2. Commit and push to the `main` branch
3. Go to the **Actions** tab in your GitHub repository
4. Watch the deployment workflow run

### 5. Optional Secrets (for advanced features)

If you want to add more features, you can also set:

- **SLACK_WEBHOOK**: For deployment notifications
  ```
  Name: SLACK_WEBHOOK
  Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
  ```

- **SENTRY_DSN**: For error monitoring
  ```
  Name: SENTRY_DSN
  Value: https://xxxxx@sentry.io/xxxxx
  ```

## Troubleshooting

### SSH Connection Failed
- Verify the SSH_KEY is correctly formatted (include all lines)
- Check if the server's firewall allows connections from GitHub Actions IPs
- Ensure the public key is in the server's `~/.ssh/authorized_keys`

### Docker Commands Not Found
- Ensure Docker is installed on your server
- The SSH user has permission to run Docker commands

### Environment Variables Not Working
- Check that all secrets are properly set in GitHub
- Verify secret names match exactly in the workflow file

## Security Best Practices

1. **Never commit secrets to your repository**
2. **Use different SSH keys for different purposes**
3. **Regularly rotate your secrets**
4. **Limit SSH key permissions on the server**
5. **Use GitHub environments for production deployments**

## Setting Up Environments (Optional but Recommended)

1. Go to Settings → Environments
2. Create a "production" environment
3. Add protection rules:
   - Required reviewers
   - Deployment branches (only main)
   - Wait timer before deployment
4. Move production secrets to the environment

This adds an extra layer of security and control over production deployments.