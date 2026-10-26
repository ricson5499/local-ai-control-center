# Security Quick Reference

## ⚡ Quick Start

1. Copy `.env.example` to `.env`
2. Set `NODE_ENV=production`
3. Keep backend on `127.0.0.1` only
4. Never commit `.env` file

## 🔒 What's Protected

| Item | Protection |
|------|-----------|
| System paths | Hidden in error messages (production) |
| Environment variables | Not logged or exposed |
| Container names | Validated, safe characters only |
| Docker commands | Uses `execFile`, not shell |
| API requests | Logged with timestamp |
| HTTP responses | Security headers added |
| CORS | Restricted to frontend origin |
| Configuration | Validated on startup |

## ⚠️ Common Mistakes

| ❌ Don't | ✅ Do |
|---------|------|
| Expose backend to internet | Keep on `127.0.0.1` only |
| Commit `.env` file | Add to `.gitignore` |
| Set `NODE_ENV=development` in production | Use `NODE_ENV=production` |
| Add untrusted containers to `services.json` | Only add containers you control |
| Set `DOCKER_DESKTOP_EXE` to random paths | Use default paths or verify carefully |
| Ignore error logs | Monitor logs regularly |
| Disable CORS | Keep CORS restrictions enabled |
| Modify security headers | Keep all security headers enabled |

## 🔍 Validation Rules

### Service IDs
```
Pattern: ^[a-zA-Z0-9_-]+$
Examples: ✅ ollama, openWebUI, my-service
          ❌ ollama@, my service, ../etc
```

### Actions
```
Allowed: start, stop, restart
Examples: ✅ POST /api/services/ollama/start
          ❌ POST /api/services/ollama/delete
```

### Container Names
```
Pattern: ^[a-zA-Z0-9_-]+$
Examples: ✅ ollama, open-webui, my_container
          ❌ ollama:latest, /container, $(whoami)
```

## 📋 Configuration Checklist

```bash
# 1. Create .env file
cp .env.example .env

# 2. Edit .env with your settings
NODE_ENV=production
HOST=127.0.0.1
PORT=8787
FRONTEND_PORT=4001

# 3. Verify services.json
cat backend/config/services.json
# Should only contain trusted containers

# 4. Start server
npm start

# 5. Check logs for errors
# Should see: "Local AI Control Center API listening on http://127.0.0.1:8787"

# 6. Test API
curl http://127.0.0.1:8787/api/health
# Should return: {"ok":true,"service":"local-ai-control-center","version":"0.1.0"}
```

## 🚨 Security Headers

These are automatically set:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## 📊 Request Logging

Every request is logged:
```
[2024-01-15T10:30:45.123Z] GET /api/health 200 5ms
[2024-01-15T10:30:46.456Z] POST /api/services/ollama/start 202 1234ms
[2024-01-15T10:30:47.789Z] GET /api/containers 200 234ms
```

Errors are logged to stderr:
```
[2024-01-15T10:30:48.000Z] Error: Docker Desktop not found
```

## 🔐 Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | — | Set to `production` for security |
| `HOST` | `127.0.0.1` | Server bind address |
| `PORT` | `8787` | Server port |
| `FRONTEND_PORT` | `4001` | Frontend port (for CORS) |
| `DOCKER_DESKTOP_EXE` | — | Docker Desktop path (optional) |

## 🧪 Testing Security

### Test input validation
```bash
# Invalid service ID (should fail)
curl -X POST http://127.0.0.1:8787/api/services/invalid%20id/start

# Invalid action (should fail)
curl -X POST http://127.0.0.1:8787/api/services/ollama/delete

# Valid request (should work)
curl -X POST http://127.0.0.1:8787/api/services/ollama/start
```

### Test error messages
```bash
# Production mode (generic error)
NODE_ENV=production npm start
# Error: "Request failed"

# Development mode (detailed error)
NODE_ENV=development npm start
# Error: "Docker Desktop not found"
```

### Test security headers
```bash
curl -i http://127.0.0.1:8787/api/health
# Look for X-Content-Type-Options, X-Frame-Options, etc.
```

## 📝 Audit Trail

Check logs for:
- ✅ All API requests logged with timestamp
- ✅ Response status codes recorded
- ✅ Request duration tracked
- ✅ Errors logged to stderr
- ✅ No sensitive data in logs

## 🆘 Troubleshooting

### "Docker Desktop not found"
- Check default paths exist
- Or set `DOCKER_DESKTOP_EXE` in `.env`
- Verify path is correct

### "Invalid service ID"
- Service ID must match `^[a-zA-Z0-9_-]+$`
- Check `services.json` for valid IDs

### "CORS error in browser"
- Check `FRONTEND_PORT` matches frontend port
- Verify CORS origin in server logs
- Restart server after changing `FRONTEND_PORT`

### "Configuration validation failed"
- Check `services.json` syntax (valid JSON)
- Verify all services have `displayName` and `containerName`
- Container names must match `^[a-zA-Z0-9_-]+$`

## 📚 More Information

- See `SECURITY.md` for detailed guidelines
- See `SECURITY_FIXES.md` for all fixes applied
- See `.env.example` for configuration options
- Check logs for debugging information

## 🔗 External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Docker Security](https://docs.docker.com/engine/security/)
