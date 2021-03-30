import Logger from 'bunyan';
import * as fs from 'fs';
import * as path from 'path';

import * as extract from './extract';
import { getLogger } from '../logger';
import * as load from './load';
import * as transform from './transform';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'categories/index';

export async function main(loggerIn: any = null, startPKey: any = null, endPKey: any = null): Promise<any> {
  const methodName: string = 'main';
  let logger = (loggerIn) ? loggerIn : getLogger(moduleName);
  logger.info({ moduleName, methodName }, `Starting...`);

  const conn = await sql.connect(logger);

  let results: any;
  
  results = await extract.categories(logger, conn);
  results = transform.categories(logger, results);
  results = await load.categories(logger, results);

  conn.close();
  
  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 3000);
  }

  logger.info({ moduleName, methodName }, `Ending.`);
}

// Start the program
if (require.main === module) {
  main();
}
