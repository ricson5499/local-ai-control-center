# Local AI Control Center

A lightweight, local-first dashboard backend for managing approved AI services and Docker containers on Windows.

The initial backend supports Docker Desktop, the `ollama` container, the `open-webui` container, Ollama model status, container statistics, and NVIDIA GPU statistics when available.

## Requirements

- Windows 10/11
- Node.js 20 or newer
- Docker Desktop
- Existing Docker containers named `ollama` and/or `open-webui`
- Ollama API available at `http://127.0.0.1:11434` (configurable)
- NVIDIA drivers and `nvidia-smi` for GPU monitoring (optional)

## Run locally

```powershell
npm install
npm start
```

The API listens on `http://127.0.0.1:8787` by default.

Check the server:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/health
```

Set a different port or Ollama URL if needed:

```powershell
$env:PORT = "8787"
$env:OLLAMA_BASE_URL = "http://127.0.0.1:11434"
npm start
```

If Docker Desktop is installed in a non-standard location, set `DOCKER_DESKTOP_EXE` to its executable path before starting the server.

## API

All routes are local control endpoints. Actions are allowlisted; the API does not provide arbitrary shell execution.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Backend health |
| GET | `/api/docker/status` | Check whether the Docker Engine is available |
| POST | `/api/docker/start` | Request Docker Desktop launch |
| GET | `/api/containers` | List all containers |
| POST | `/api/services/ollama/start` | Start the Ollama container |
| POST | `/api/services/ollama/stop` | Stop the Ollama container |
| POST | `/api/services/ollama/restart` | Restart the Ollama container |
| POST | `/api/services/openWebUI/start` | Start the Open WebUI container |
| POST | `/api/services/openWebUI/stop` | Stop the Open WebUI container |
| POST | `/api/services/openWebUI/restart` | Restart the Open WebUI container |
| GET | `/api/services/ollama/stats` | One-time Docker CPU/RAM/network stats |
| GET | `/api/services/openWebUI/stats` | One-time Docker CPU/RAM/network stats |
| GET | `/api/ollama/models` | List downloaded Ollama models |
| GET | `/api/ollama/loaded` | List models currently loaded in Ollama |
| GET | `/api/system/gpu` | NVIDIA GPU stats, or an empty list if unavailable |

Example:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8787/api/services/ollama/start
Invoke-RestMethod http://127.0.0.1:8787/api/ollama/loaded
```

## Configuration

Edit `config/services.json` to change the display names and existing container names. The initial version intentionally supports only configured service IDs.

The initial implementation uses Docker CLI commands and the Ollama HTTP API. It does not create, delete, or pull containers yet. Those administrative actions should be added as explicit endpoints with validation before being exposed in the UI.

## Security notes

- The backend binds to `127.0.0.1` by default.
- Do not expose this API directly to the public internet or bind it to `0.0.0.0` without adding authentication and appropriate protections.
- Only predefined service IDs and actions are supported. Do not add an endpoint that passes arbitrary request values to a shell.
- The Docker CLI has significant host-level privileges. Treat this API as a local administrative tool.
- If you use a browser extension or custom frontend, keep requests on localhost and avoid enabling broad CORS unnecessarily.

## Current limitations

- No frontend is included in this backend starter.
- Docker Desktop launch is a request, not confirmation that Docker is ready. Poll `/api/docker/status` until `available` is `true`.
- GPU monitoring currently supports NVIDIA `nvidia-smi`; other vendors need a separate implementation.
- Model loading is reported by Ollama's `/api/ps` endpoint. A downloaded model is not necessarily loaded in memory.
- TTS support is planned, not implemented yet.

## Roadmap

- [ ] Add frontend dashboard
- [ ] Add operation logs and better error messages
- [ ] Add explicit pull/create workflows
- [ ] Add TTS service definitions
- [ ] Add tests and configuration validation

## License

Choose a license before publishing the first public release. MIT is a simple option for a small utility project; confirm that it matches your goals before adding the license file.
