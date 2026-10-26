# Security Guidelines

This document outlines security considerations for Local AI Control Center.

## Overview

Local AI Control Center is designed to run locally on your machine. It controls Docker containers and system processes, so security is critical.

## Key Security Features

- **Localhost binding** — Backend binds to `127.0.0.1` by default, not exposed to the network
- **Input validation** — All user inputs are validated against whitelists
- **Configuration validation** — `services.json` is validated on startup
- **Safe command execution** — Uses `execFile` instead of `exec` to prevent shell injection
- **Error handling** — Sensitive information is not leaked in error messages
- **Security headers** — HTTP headers prevent common attacks (CSP, X-Frame-Options, etc.)
- **Request logging** — All API requests are logged for audit purposes
- **CORS restrictions** — Only allows requests from the configured frontend origin

## Deployment Security

### Local Deployment (Recommended)

1. Run the backend on `127.0.0.1:8787` (default)
2. Run the frontend on `127.0.0.1:4001` (default)
3. Access via `http://127.0.0.1:4001` only
4. Do not expose to the network

### Environment Variables

Set these in your `.env` file (never commit this file):

```
NODE_ENV=production
HOST=127.0.0.1
PORT=8787
FRONTEND_PORT=4001
DOCKER_DESKTOP_EXE=C:\Program Files\Docker\Docker\Docker Desktop.exe
```

**Important:** Only set `DOCKER_DESKTOP_EXE` if the default paths don't work. Verify the path is correct.

## Configuration Security

### services.json

The `services.json` file defines which containers can be controlled. Only add containers you trust.

```json
{
  "ollama": {
    "displayName": "Ollama",
    "containerName": "ollama"
  }
}
```

**Validation rules:**
- `displayName` must be a non-empty string
- `containerName` must contain only alphanumeric characters, hyphens, and underscores
- Invalid configurations will cause the server to exit

## Input Validation

All user inputs are validated:

- **Service IDs** — Must match `^[a-zA-Z0-9_-]+$`
- **Actions** — Must be one of: `start`, `stop`, `restart`
- **Container names** — Must match `^[a-zA-Z0-9_-]+$`

## What NOT to Do

- ❌ Do not expose the backend to the public internet
- ❌ Do not commit `.env` files or credentials
- ❌ Do not modify `services.json` to include untrusted containers
- ❌ Do not set `DOCKER_DESKTOP_EXE` to arbitrary paths
- ❌ Do not run with `NODE_ENV=development` in production
- ❌ Do not disable CORS or security headers

## Sensitive Information

The following are considered sensitive and are protected:

- System file paths (not returned in error messages)
- Environment variables (not logged or exposed)
- Container names and image names (filtered in responses)
- Docker configuration details
- GPU information (only returned if available)

## Audit Logging

All API requests are logged with:
- Timestamp
- HTTP method
- Request path
- Response status code
- Duration

Errors are logged to stderr with full details for debugging.

## Remote Access (Not Recommended)

If you must expose this application remotely:

1. Use a reverse proxy (nginx, Apache) with authentication
2. Enable HTTPS/TLS
3. Implement rate limiting
4. Add API key authentication
5. Use a VPN or SSH tunnel instead

**Better alternative:** Use SSH port forwarding:
```bash
ssh -L 8787:127.0.0.1:8787 user@remote-host
```

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. Do not open a public issue
2. Contact the maintainers privately
3. Include details about the vulnerability
4. Allow time for a fix before public disclosure

## Dependencies

This project uses minimal dependencies:
- `express` — Web framework
- `cors` — CORS middleware

Keep these updated for security patches:
```bash
npm audit
npm update
```

## Best Practices

1. **Keep Node.js updated** — Use Node.js 20 or later
2. **Review services.json** — Only add containers you control
3. **Monitor logs** — Check logs regularly for suspicious activity
4. **Use strong system passwords** — Protect your local machine
5. **Disable remote access** — Keep the backend local-only
6. **Update dependencies** — Run `npm audit` regularly

## Security Checklist

- [ ] Backend runs on `127.0.0.1` only
- [ ] `.env` file is in `.gitignore`
- [ ] `services.json` contains only trusted containers
- [ ] `NODE_ENV=production` in production
- [ ] No credentials in code or configuration
- [ ] Dependencies are up to date
- [ ] Logs are monitored
- [ ] CORS is configured correctly
- [ ] Security headers are enabled
- [ ] Input validation is working

## License

MIT
