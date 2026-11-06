# API Token Setup Guide

## Overview

The Local AI Control Center now requires a Bearer Token for all API communications between the frontend and backend. This adds an authentication layer to prevent unauthorized access.

## Setup Instructions

### 1. Generate a Secure Token

Generate a strong random token using one of these methods:

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString())) | ForEach-Object { $_ -replace '[^a-zA-Z0-9]', '' }
```

**Or use a simple approach:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Example token:**
```
aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3
```

### 2. Configure Backend

1. Copy `.env.example` to `.env` (if not already done):
   ```
   copy .env.example .env
   ```

2. Edit `.env` and set your token:
   ```
   API_TOKEN=your-secure-token-here
   ```

3. Replace `your-secure-token-here` with your generated token.

### 3. Configure Frontend

The frontend will automatically read the token from:
1. `window.API_TOKEN` (if set in HTML)
2. `localStorage` under key `api-token`

**Option A: Set via localStorage (Recommended)**

Open the browser console (F12) and run:
```javascript
localStorage.setItem('api-token', 'your-secure-token-here');
location.reload();
```

**Option B: Set in HTML**

Edit `frontend/index.html` and update the script tag:
```html
<script>
  window.BACKEND_URL = 'http://127.0.0.1:8787';
  window.API_TOKEN = 'your-secure-token-here';
</script>
```

### 4. Restart Services

1. Stop the backend server (if running)
2. Start the backend server:
   ```
   npm start
   ```
3. Refresh the frontend in your browser

## Security Best Practices

- **Never commit `.env` to version control** — it's already in `.gitignore`
- **Use a strong, random token** — at least 32 characters
- **Rotate tokens periodically** — change your token every 3-6 months
- **Keep tokens secret** — don't share them or commit them to repositories
- **Use HTTPS in production** — Bearer tokens should only be sent over encrypted connections
- **Monitor access logs** — check server logs for unauthorized access attempts (401 errors)

## Troubleshooting

### "Unauthorized" Error

If you see a 401 error:
1. Verify the token in `.env` matches the token in the frontend
2. Check that the token is set correctly in localStorage or HTML
3. Ensure there are no extra spaces or line breaks in the token
4. Restart both backend and frontend

### Token Not Being Sent

If requests fail with "Unauthorized" but you've set the token:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Make a request and check the Authorization header
4. It should show: `Authorization: Bearer your-token-here`

## Generating Tokens Programmatically

If you need to generate tokens in your application:

**Node.js:**
```javascript
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
console.log(token);
```

**Python:**
```python
import secrets
token = secrets.token_hex(32)
print(token)
```

## Disabling Token Authentication (Development Only)

To disable token authentication for development:

1. Edit `backend/server.js`
2. Comment out or remove the Bearer Token middleware
3. **Never do this in production**

## Additional Security Measures

The application already includes:
- CORS restrictions (only localhost)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Input validation on all API endpoints
- Command injection prevention
- JSON payload size limits (16KB)

These work together with Bearer Token authentication to provide defense-in-depth security.
