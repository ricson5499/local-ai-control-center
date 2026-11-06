# Local AI Control Center

A lightweight local web dashboard for managing AI services, Docker containers, and system resources on Windows.

## Overview

Local AI Control Center aims to replace repetitive command-line and batch-file operations with a simple web interface.

The initial focus is on managing Ollama and Open WebUI running in Docker Desktop.

## Features

### Implemented

- **Dashboard** — View services and their current status.
- **Docker Management** — Start Docker Desktop and manage supported containers.
- **Ollama Management** — Start, stop, and inspect Ollama containers.
- **Open WebUI Management** — Start and stop Open WebUI containers.
- **Resource Monitoring** — View container CPU and memory usage, plus NVIDIA GPU statistics when available.
- **Model Status** — Check available models and currently loaded models.
- **Ollama Command Execution** — Execute Ollama commands directly from the web interface (e.g., `run qwen3:8b`).
- **Bearer Token Authentication** — Secure API communication between frontend and backend.

### Planned

- **Logs** — View command output and service errors.
- **Extensible Services** — Allow additional local AI services, including TTS, to be added later.
- **Advanced Monitoring** — Enhanced resource tracking and performance metrics.

## Technology Stack

- Frontend: HTML, CSS, and JavaScript
- Backend: Node.js
- API: Express
- Container Management: Docker Engine
- LLM Runtime: Ollama
- GPU Monitoring: NVIDIA System Management Interface (`nvidia-smi`)

The stack may evolve as the project develops.

## Requirements

- Windows
- Node.js and npm
- Docker Desktop
- Ollama Docker image
- NVIDIA drivers and `nvidia-smi` for NVIDIA GPU monitoring

Some features may require additional configuration.

## Getting Started

### Prerequisites

- Windows 10 or later
- Node.js 16+ and npm
- Docker Desktop (running)
- Ollama Docker image
- (Optional) NVIDIA drivers and `nvidia-smi` for GPU monitoring

### Installation

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/yourusername/local-ai-control-center.git
   cd local-ai-control-center
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Configure environment variables**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and set your API token:
   ```
   API_TOKEN=your-secure-token-here
   ```
   See [SETUP_TOKEN.md](SETUP_TOKEN.md) for token generation instructions.

4. **Start the backend server**
   ```bash
   npm start
   ```
   The backend will listen on `http://127.0.0.1:8787`

5. **Open the frontend**
   - Open your browser and navigate to `http://127.0.0.1:8787`
   - Configure the API token in your browser:
     ```javascript
     localStorage.setItem('api-token', 'your-secure-token-here');
     location.reload();
     ```

### Quick Start

1. Ensure Docker Desktop is running
2. Start the backend: `npm start`
3. Open `http://127.0.0.1:8787` in your browser
4. Set your API token in the browser console
5. Use the dashboard to manage your services

### Using Ollama Command Execution

The dashboard includes a command execution panel where you can run Ollama commands directly:

1. Scroll to the "Ollama Command" section
2. Enter a command (e.g., `run qwen3:8b` or `list`)
3. Click "Execute"
4. View the output in the panel below

Supported commands include:
- `run <model>` — Run a model
- `list` — List available models
- `pull <model>` — Download a model
- `show <model>` — Show model details

The application is intended to run locally on the host machine. The backend must have permission to communicate with Docker and execute approved system commands.

## Project Structure

The proposed structure is intentionally simple:

```text
local-ai-control-center/
├── backend/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── config/
├── .gitignore
├── package.json
├── LICENSE
└── README.md
```

The structure may be adjusted during implementation to avoid unnecessary complexity.

## Security

This application can control local processes and Docker containers. Security is a priority.

### Built-in Security Features

- **Bearer Token Authentication** — All API requests require a valid Bearer Token
- **CORS Restrictions** — Only localhost is allowed to access the API
- **Security Headers** — Includes X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, and HSTS
- **Input Validation** — All API inputs are validated and sanitized
- **Command Injection Prevention** — Ollama commands are parsed safely without shell interpretation
- **Payload Size Limits** — JSON payloads limited to 16KB
- **Localhost Binding** — Backend binds to `127.0.0.1` by default (not exposed to network)

### Security Best Practices

- **Never expose the backend to the public internet** — This application is designed for local use only
- **Use a strong API token** — Generate a random 32+ character token (see [SETUP_TOKEN.md](SETUP_TOKEN.md))
- **Keep `.env` file secret** — Never commit it to version control (already in `.gitignore`)
- **Rotate tokens periodically** — Change your API token every 3-6 months
- **Monitor access logs** — Check server logs for unauthorized access attempts (401 errors)
- **Use HTTPS in production** — If you must expose this remotely, use HTTPS and additional authentication
- **Restrict Docker permissions** — Run the application with minimal required Docker permissions
- **Validate all user input** — The application validates Ollama commands to prevent injection attacks

### API Token Configuration

For detailed token setup instructions, see [SETUP_TOKEN.md](SETUP_TOKEN.md).

Quick setup:
1. Generate a secure token
2. Set `API_TOKEN` in `.env`
3. Configure the token in your browser's localStorage
4. All API requests will automatically include the Bearer Token

### Reporting Security Issues

If you discover a security vulnerability, please report it responsibly. Do not open a public issue. Instead, contact the maintainers directly.

## Roadmap

- [x] Build the initial dashboard.
- [x] Implement the local Node.js backend.
- [x] Add Docker and container controls.
- [x] Add Ollama and Open WebUI controls.
- [x] Display live service status and resource usage.
- [x] Add Ollama command execution.
- [x] Implement Bearer Token authentication.
- [ ] Add logs and error reporting.
- [ ] Add configurable service definitions.
- [ ] Add support for TTS and other local AI services.
- [ ] Add model management (pull, delete, update).
- [ ] Add performance metrics and historical data.
- [ ] Add webhook support for service events.

## API Documentation

All API endpoints require a Bearer Token in the `Authorization` header:

```
Authorization: Bearer your-api-token
```

### Endpoints

#### Health Check
- `GET /api/health` — Check if the backend is running

#### Docker
- `GET /api/docker/status` — Get Docker Engine status
- `POST /api/docker/start` — Start Docker Desktop
- `GET /api/containers` — List all containers

#### Services
- `POST /api/services/:serviceId/:action` — Control a service (start/stop/restart)
- `GET /api/services/:serviceId/stats` — Get service resource usage

#### Ollama
- `GET /api/ollama/models` — List available models
- `GET /api/ollama/loaded` — List currently loaded models
- `POST /api/ollama/run` — Execute an Ollama command
  - Body: `{ "command": "run qwen3:8b" }`

#### System
- `GET /api/system/gpu` — Get NVIDIA GPU information

### Example Request

```bash
curl -H "Authorization: Bearer your-api-token" http://127.0.0.1:8787/api/health
```

## Contributing

Contributions, ideas, and improvements are welcome.

Keep the implementation lightweight, maintainable, and easy to configure.

## License

MIT
