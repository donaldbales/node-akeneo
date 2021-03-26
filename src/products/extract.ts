import Logger from 'bunyan';
import * as fs from 'fs';
import * as path from 'path';

import * as akeneo from '../akeneo';
import { inspect } from '../inspect';
import * as setter from '../setter';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'products/extract';

export async function products(logger: Logger, conn: any, startPKey: string, endPKey: string) {
  const methodName: string = 'products';
  logger.info({ moduleName, methodName }, `Starting...`);

  const query = `
  SELECT 
  FROM   
  WHERE  p.PKey BETWEEN '${startPKey}' and '${endPKey}';
  `;

  let results: any = [];
  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results });
  } catch (err) {
    logger.error({ moduleName, methodName, err, query });
    process.exit(99);
  }

  for (const result of results) {

  }

  fs.writeFileSync(`${exportPath}${path.sep}extractedProducts_.${startPKey}_${endPKey}.json`,
  	JSON.stringify(results, null, '  '));
  
  return results;
}
