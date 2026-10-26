# Local AI Control Center — frontend preview

A plain HTML/CSS/JavaScript dashboard UI using Tabler via CDN. No frontend build step.

## Preview

The page expects the companion Node/Express backend to serve the `frontend/` folder and provide these API endpoints:

- `GET /api/health`
- `GET /api/docker/status`
- `GET /api/containers`
- `GET /api/ollama/models`
- `GET /api/ollama/loaded`
- `GET /api/system/gpu`
- `POST /api/services/:serviceId/:action`
- `POST /api/docker/start`

It is not a standalone live dashboard if opened directly as a local file. Use the backend server so relative `/api/...` requests work.

Tabler CSS is loaded from jsDelivr, so the first page load requires internet access. The version is pinned to `@tabler/core@1.7.1` rather than `@latest`.
