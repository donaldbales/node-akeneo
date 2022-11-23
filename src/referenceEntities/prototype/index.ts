import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import * as extract from './extract';
import { REFERENCE_ENTITY_CODE } from './helper';
import { getLogger } from '../../logger';
import * as load from './load';
import * as transform from './transform';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = `referenceEntities/${REFERENCE_ENTITY_CODE}/index`;

export async function main(loggerIn: any = null): Promise<any> {
  const methodName: string = 'main';
  let logger = (loggerIn) ? loggerIn : getLogger('certifications');
  logger.info({ moduleName, methodName }, `Starting...`);
  const conn = await sql.connect(logger);

  let results: any = null;

  results = await load.referenceEntity(logger);

  results =       extract.referenceEntityAttributes(logger);
  results =       transform.referenceEntityAttributes(logger, results);
  results = await load.referenceEntityAttributes(logger, results);
  
  results = await extract.extractImages(logger, conn);
  results = await load.loadImages(logger, conn);
    
  results = await extract.referenceEntityRecords(logger, conn);
  results =       transform.referenceEntityRecords(logger, results);
  results = await load.referenceEntityRecords(logger, results);
  
  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 3000);
  }

  logger.info({ moduleName, methodName }, `Ending.`);
}

// Start the program
if (require.main === module) {
  main();
}
