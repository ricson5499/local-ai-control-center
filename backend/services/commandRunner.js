const { execFile } = require('node:child_process');

function runCommand(file, args, options = {}) {
  const timeout = options.timeout ?? 10000;

  return new Promise((resolve, reject) => {
    execFile(
      file,
      args,
      {
        windowsHide: true,
        timeout,
        maxBuffer: 1024 * 1024,
        encoding: 'utf8'
      },
      (error, stdout, stderr) => {
        if (error) {
          const detail = (stderr || stdout || error.message || '').trim();
          const wrapped = new Error(detail || `${file} command failed`);
          wrapped.code = error.code;
          wrapped.exitCode = error.code === null ? null : error.code;
          return reject(wrapped);
        }

        resolve({
          stdout: (stdout || '').trim(),
          stderr: (stderr || '').trim()
        });
      }
    );
  });
}

module.exports = { runCommand };
