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

// Validate configuration schema
function validateServiceConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid configuration: must be an object');
  }
  
  for (const [key, service] of Object.entries(config)) {
    if (!service.displayName || typeof service.displayName !== 'string') {
      throw new Error(`Invalid service "${key}": missing or invalid displayName`);
    }
    if (!service.containerName || typeof service.containerName !== 'string') {
      throw new Error(`Invalid service "${key}": missing or invalid containerName`);
    }
    // Validate containerName contains only safe characters
    if (!/^[a-zA-Z0-9_-]+$/.test(service.containerName)) {
      throw new Error(`Invalid service "${key}": containerName contains unsafe characters`);
    }
  }
  
  return config;
}

let serviceConfig;
try {
  const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  serviceConfig = validateServiceConfig(rawConfig);
} catch (error) {
  console.error('Failed to load configuration:', error.message);
  process.exit(1);
}

function getConfiguredContainer(serviceId) {
  const service = serviceConfig[serviceId];
  if (!service) {
    const error = new Error('Unknown service ID');
    error.status = 404;
    throw error;
  }
  return service;
}

// Validate container action
function validateAction(action) {
  const allowed = ['start', 'stop', 'restart'];
  if (!allowed.includes(action)) {
    const error = new Error('Unsupported container action');
    error.status = 400;
    throw error;
  }
  return action;
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
      const error = new Error('Docker Desktop not found');
      error.status = 500;
      throw error;
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
    const serviceId = req.params.serviceId;
    const action = req.params.action;
    
    // Validate inputs
    if (!/^[a-zA-Z0-9_-]+$/.test(serviceId)) {
      const error = new Error('Invalid service ID');
      error.status = 400;
      throw error;
    }
    
    validateAction(action);
    const service = getConfiguredContainer(serviceId);
    const result = await containerAction(service.containerName, action);
    res.json({ ok: true, serviceId, displayName: service.displayName, ...result });
  } catch (error) {
    next(error);
  }
});

router.get('/services/:serviceId/stats', async (req, res, next) => {
  try {
    const serviceId = req.params.serviceId;
    
    if (!/^[a-zA-Z0-9_-]+$/.test(serviceId)) {
      const error = new Error('Invalid service ID');
      error.status = 400;
      throw error;
    }
    
    const service = getConfiguredContainer(serviceId);
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
