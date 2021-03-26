// src/setter.ts

import Logger from 'bunyan';
import * as fs from 'fs';
import * as path from 'path';

import { getLogger } from './logger';

const moduleName: string = 'setter';
const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';

export function load(logger: Logger, filename: string, set: Set<string>, key: string): Promise<any> {
  const methodName: string = 'load';
  logger.info({ moduleName, methodName, filename, set, key }, `Starting`);
  
  return new Promise((resolve, reject) => {
    let stream: any = null;

    if (filename) {
      let stat: any = null;
      try {
        stat = fs.statSync(filename);
      } catch(err) {
        const error: any = err.message ? err.message : err;
        logger.error({ moduleName, methodName, error }, `Error!`);
        return resolve(set);
      }
      if (stat &&
        stat.size > 0) {
        stream = fs.createReadStream(filename);
      }
    }

    const timer = setTimeout(() => { 
      const error: string = 'timed out.';
      logger.error({ moduleName, methodName, error }, `Error!`);
      reject(error);
    }, 3000);

    let data = '';

    if (stream) {
      logger.debug({ moduleName, methodName, stream }, `reading stream`);
      stream.setEncoding('utf8');

      stream.on('data', (chunk: string) => {
        clearTimeout(timer);
        // console.log('stream.on data');
        // console.log(chunk);
        data += chunk;
        let linefeed = 0;
        while ((linefeed = data.indexOf('\n')) > -1) {
          // console.log(linefeed);
          const json = data.slice(0, linefeed).trim();
          // console.log(json);
          if (json) {
            const doc = JSON.parse(json);
            // console.log(doc);
            set.add(doc[key]);
          }
          data = data.slice(linefeed + 1, data.length);
        }
      });

      stream.on('end', () => {
        clearTimeout(timer);
        // console.log('stream.on end');
        if (data) {
          const json = data.trim();
          // console.log(json);
          if (json) {
            const doc = JSON.parse(json);
            // console.log(doc);
            set.add(doc[key]);
          }
        }
        // console.log(set);
        logger.info({ moduleName, methodName, filename, size: set.size }, `Set Size`);
        resolve(set);
      });

      stream.on('error', (err: any) => {
        clearTimeout(timer);
        const error: any = err.message ? err.message : err;
        logger.error({ moduleName, methodName, error }, `stream.on error: ${err.message}`);
        reject(error);
      });
    }
  });  
} 

export async function main(): Promise<any> {
  const methodName: string = 'main';
  const logger = getLogger(moduleName);
  logger.info({ moduleName, methodName }, `Starting...`);

  const tableName: string = 'CutSheetThumbnails';
  const extractedSetPath: string = `${exportPath}${path.sep}${tableName}${path.sep}extractedMap.vac`;
  const extractedSet: Set<string> = new Set();
  
  const results: any = await load(logger, extractedSetPath, extractedSet, 'BlobLink');
  
  console.log(results);
  console.log(results.size);

  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 3000);
  }

  logger.info({ moduleName, methodName }, `Ending.`);
}

// Start the program
if (require.main === module) {
  main();
}
