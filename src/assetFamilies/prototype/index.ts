import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { ASSET_FAMILY_CODE } from './helper';
import * as extract from './extract';
import * as load from './load';
import * as transform from './transform';
import { getLogger } from '../../logger';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = `assetFamilies/${ASSET_FAMILY_CODE}/index`;

export async function main(loggerIn: any = null, startPKey: string = '', endPKey: string = ''): Promise<any> {
  const methodName: string = 'main';
  let logger = (loggerIn) ? loggerIn : getLogger(moduleName);
  logger.info({ moduleName, methodName }, `Starting...`);
  const conn = await sql.connect(logger);

  let results: any = null;

  if (!(startPKey)) {
    results = await load.assetFamily(logger);

    results =       extract.assetFamilyAttributes(logger);
    results =       transform.assetFamilyAttributes(logger, results);
    results = await load.assetFamilyAttributes(logger, results);
  } else {
    results = await extract.assetFamilyAssets(logger, conn, startPKey, endPKey);
    fs.writeFileSync(`${exportPath}${path.sep}extractedImageAssets.json`,
      JSON.stringify(results).toString().replace(/},{/g, `},\n{`));
    
    results =       transform.assetFamilyAssets(logger, results);
    fs.writeFileSync(`${exportPath}${path.sep}transformedImageAssets.json`,
      JSON.stringify(results).toString().replace(/},{/g, `},\n{`));

    results = await load.assetFamilyAssets(logger, results);
  }
  
  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 3000);
  }

  logger.info({ moduleName, methodName }, `Ending.`);
}

// Start the program
if (require.main === module) {
  main();
}
