const { runCommand } = require('./commandRunner');

async function getGpuInfo() {
  try {
    const result = await runCommand('nvidia-smi', [
      '--query-gpu=name,utilization.gpu,memory.used,memory.total',
      '--format=csv,noheader,nounits'
    ], { timeout: 5000 });

    return result.stdout
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [name, utilization, memoryUsed, memoryTotal] = line.split(',').map((part) => part.trim());
        return {
          name,
          utilizationPercent: utilization,
          memoryUsedMiB: memoryUsed,
          memoryTotalMiB: memoryTotal
        };
      });
  } catch {
    return [];
  }
}

module.exports = { getGpuInfo };
