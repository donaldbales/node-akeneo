// executor.ts

import * as childProcess from 'child_process';

const moduleName: string = 'executor';

export async function exec(logger: any, command: string, options: any = {}): Promise<any> {
  const methodName: string = 'exec';
  logger.debug({ moduleName, methodName }, `Starting...`);
  
  return new Promise((resolve, reject) => {
    const result: any = { code: -1, error: null, stderr: null, stdout: null };

    const handle = childProcess.exec(command, options);

    handle.stdout.on('data', (data) => {
      logger.debug({ moduleName, methodName, data }, `stdout.on data`);
      if (!result.stdout) {
        result.stdout = [];
      }
      result.stdout.push(data);
    });

    handle.stderr.on('data', (data) => {
      logger.warn({ moduleName, methodName, data }, `stderr.on data`);
      if (!result.stderr) {
        result.stderr = [];
      }
      result.stderr.push(data);
    });

    handle.on('close', (code) => {
      logger.debug({ moduleName, methodName, code }, `on close`);
      result.code = code;
      resolve(result);
    });

    handle.on('error', (error) => {
      logger.error({ moduleName, methodName, error }, `on error`);
      result.error = error;
      reject(result);
    });
  });
}
