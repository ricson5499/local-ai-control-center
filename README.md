# Local AI Control Center

A lightweight local web dashboard for managing AI services, Docker containers, and system resources on Windows.

## Overview

Local AI Control Center aims to replace repetitive command-line and batch-file operations with a simple web interface.

The initial focus is on managing Ollama and Open WebUI running in Docker Desktop.

## Features

### Planned

- **Dashboard** — View services and their current status.
- **Docker Management** — Start Docker Desktop and manage supported containers.
- **Ollama Management** — Start, stop, and inspect Ollama.
- **Open WebUI Management** — Start and stop Open WebUI.
- **Resource Monitoring** — View container CPU and memory usage, plus NVIDIA GPU statistics when available.
- **Model Status** — Check available models and currently loaded models.
- **Logs** — View command output and service errors.
- **Extensible Services** — Allow additional local AI services, including TTS, to be added later.

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

Setup instructions will be added as the first working version becomes available.

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

This application can control local processes and Docker containers.

- Bind the backend to `127.0.0.1` by default.
- Do not expose the control API directly to the public internet.
- Restrict executable commands to explicitly supported operations.
- Validate API inputs and avoid passing arbitrary user input to shell commands.
- Do not commit personal paths, credentials, or private configuration files.

Remote access should require additional authentication and security controls.

## Roadmap

- [ ] Build the initial dashboard.
- [ ] Implement the local Node.js backend.
- [ ] Add Docker and container controls.
- [ ] Add Ollama and Open WebUI controls.
- [ ] Display live service status and resource usage.
- [ ] Add logs and error reporting.
- [ ] Add configurable service definitions.
- [ ] Add support for TTS and other local AI services.

## Contributing

Contributions, ideas, and improvements are welcome.

Keep the implementation lightweight, maintainable, and easy to configure.

## License

MIT
