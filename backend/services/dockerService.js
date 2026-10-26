const { runCommand } = require('./commandRunner');

async function docker(args, options) {
  return runCommand('docker', args, options);
}

async function getDockerInfo() {
  try {
    const result = await docker(['info', '--format', '{{.ServerVersion}}'], { timeout: 8000 });
    return { available: true, serverVersion: result.stdout || null };
  } catch (error) {
    return { available: false, serverVersion: null };
  }
}

async function listContainers() {
  const result = await docker([
    'ps', '-a',
    '--format', '{{json .}}'
  ]);

  if (!result.stdout) return [];

  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        const row = JSON.parse(line);
        return {
          id: row.ID,
          names: row.Names,
          image: row.Image,
          status: row.Status,
          state: row.State,
          ports: row.Ports
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function containerAction(containerName, action) {
  if (!['start', 'stop', 'restart'].includes(action)) {
    throw new Error('Unsupported container action');
  }

  const result = await docker([action, containerName], { timeout: 60000 });
  return { containerName, action, output: result.stdout };
}

async function containerStats(containerName) {
  const result = await docker([
    'stats', containerName, '--no-stream',
    '--format', '{{json .}}'
  ], { timeout: 15000 });

  if (!result.stdout) return null;

  const row = JSON.parse(result.stdout);
  return {
    name: row.Name,
    cpuPercent: row.CPUPerc,
    memoryUsage: row.MemUsage,
    memoryPercent: row.MemPerc,
    networkIO: row.NetIO,
    blockIO: row.BlockIO,
    pids: row.PIDs
  };
}

module.exports = {
  getDockerInfo,
  listContainers,
  containerAction,
  containerStats
};
