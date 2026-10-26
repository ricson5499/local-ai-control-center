const express = require('express');
const path = require('node:path');
const fs = require('node:fs');

const {
  getDockerInfo,
  listContainers,
  containerAction,
  containerStats
} = require('../services/dockerService');
const { listModels, listLoadedModels } = require('../services/ollamaService');
const { getGpuInfo } = require('../services/systemService');

const router = express.Router();
const configPath = path.join(__dirname, '../config/services.json');
const serviceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

function getConfiguredContainer(serviceId) {
  const service = serviceConfig[serviceId];
  if (!service) {
    const error = new Error('Unknown service ID');
    error.status = 404;
    throw error;
  }
  return service;
}

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'local-ai-control-center', version: '0.1.0' });
});

router.get('/docker/status', async (req, res, next) => {
  try {
    res.json(await getDockerInfo());
  } catch (error) {
    next(error);
  }
});

router.post('/docker/start', async (req, res, next) => {
  try {
    const { spawn } = require('node:child_process');
    const { existsSync } = require('node:fs');
    const candidates = [
      process.env.DOCKER_DESKTOP_EXE,
      'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
      `${process.env.LOCALAPPDATA || ''}\\Programs\\Docker\\Docker Desktop.exe`
    ].filter(Boolean);

    const executable = candidates.find(existsSync);
    if (!executable) {
      return res.status(500).json({
        error: 'Docker Desktop executable not found. Set DOCKER_DESKTOP_EXE in your environment.'
      });
    }

    const child = spawn(executable, [], { detached: true, stdio: 'ignore', windowsHide: true });
    child.unref();
    res.status(202).json({ ok: true, message: 'Docker Desktop launch requested. Poll /api/docker/status until ready.' });
  } catch (error) {
    next(error);
  }
});

router.get('/containers', async (req, res, next) => {
  try {
    const [containers, dockerStatus] = await Promise.all([
      listContainers(),
      getDockerInfo()
    ]);
    res.json({ docker: dockerStatus, containers });
  } catch (error) {
    next(error);
  }
});

router.post('/services/:serviceId/:action', async (req, res, next) => {
  try {
    const service = getConfiguredContainer(req.params.serviceId);
    const result = await containerAction(service.containerName, req.params.action);
    res.json({ ok: true, serviceId: req.params.serviceId, displayName: service.displayName, ...result });
  } catch (error) {
    next(error);
  }
});

router.get('/services/:serviceId/stats', async (req, res, next) => {
  try {
    const service = getConfiguredContainer(req.params.serviceId);
    res.json(await containerStats(service.containerName));
  } catch (error) {
    next(error);
  }
});

router.get('/ollama/models', async (req, res, next) => {
  try {
    res.json({ models: await listModels() });
  } catch (error) {
    next(error);
  }
});

router.get('/ollama/loaded', async (req, res, next) => {
  try {
    res.json({ models: await listLoadedModels() });
  } catch (error) {
    next(error);
  }
});

router.get('/system/gpu', async (req, res, next) => {
  try {
    res.json({ gpus: await getGpuInfo() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
