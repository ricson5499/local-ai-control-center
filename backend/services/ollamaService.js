const { runCommand } = require('./commandRunner');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';

async function requestOllama(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Ollama returned HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function listModels() {
  const data = await requestOllama('/api/tags');
  return (data.models || []).map((model) => ({
    name: model.name,
    model: model.model,
    size: model.size,
    modifiedAt: model.modified_at,
    details: model.details
  }));
}

async function listLoadedModels() {
  const data = await requestOllama('/api/ps');
  return (data.models || []).map((model) => ({
    name: model.name,
    model: model.model,
    size: model.size,
    sizeVram: model.size_vram,
    expiresAt: model.expires_at,
    details: model.details
  }));
}

async function runOllamaCommand(args) {
  // Only fixed, non-interactive commands should be added here.
  return runCommand('docker', ['exec', 'ollama', 'ollama', ...args], { timeout: 15000 });
}

module.exports = {
  listModels,
  listLoadedModels,
  runOllamaCommand
};
