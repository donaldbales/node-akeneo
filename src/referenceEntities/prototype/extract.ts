import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { REFERENCE_ENTITY_CODE } from './helper';
import { getLogger } from '../../logger';
import * as mapper from '../../mapper';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = `referenceEntities/${REFERENCE_ENTITY_CODE}/extract`;

const extractedImagesMap: Map<string, any> = new Map();
const loadedImagesMap: Map<string, any> = new Map();

export async function extractImages(logger: Logger, conn: any): Promise<any[]> {
  const methodName: string = 'extractImages';
  logger.info({ moduleName, methodName }, `Starting...`);
  
  const tableName: string = REFERENCE_ENTITY_CODE;
  const mapPath: string = `${exportPath}${path.sep}${tableName}${path.sep}extractedImagesMap.vac`;
  akeneo.mkdirs([ tableName ]);

  if (extractedImagesMap.size === 0) {
    await mapper.load(logger, mapPath, extractedImagesMap, 'PKey');
  }

  const query: string = `
    SELECT distinct 
           
    FROM   
    WHERE  
    ORDER BY 
  `;

  let rows: any[] = [];
  try {
    rows = await sql.executeDML(logger, conn, query);
    logger.info({ moduleName, methodName, rows: rows.length });
  } catch (err) {
    logger.error({ moduleName, methodName, err });
    process.exit(99);
  }

  for (const row of rows) {
    const code: string = akeneo.attributeCode(row.Text);
    const imagePath: string = `${exportPath}${path.sep}${code}.png`;
    if (!(extractedImagesMap.has(row.PKey))) {
      const image: any = row.Image;    
      fs.writeFileSync(imagePath, image);
      delete row.Image;
      row.code = code;
      row.imagePath = imagePath;
      const file: any = fs.openSync(mapPath, 'a');
      fs.writeSync(file, `${JSON.stringify(row)}\n`);
      fs.closeSync(file);

      logger.info({ moduleName, methodName, code }, 
        `${row.DataLength} bytes written to ${imagePath}.`);    
    } else {
      logger.info({ moduleName, methodName, code }, 
        `${imagePath} already exists.`);    
    }
  }

  return [ 'OK' ];
}

export function referenceEntityAttributes(logger: Logger): any {
  const methodName: string = 'referenceEntityAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  const attributeMap: any = {};
  
  // Manually add an Text attribute
  attributeMap['Text'] = { sql_data_type: 'nvarchar' };
  attributeMap['Text']['akeneo_type'] = akeneo.REFERENCE_ENTITY_TEXT;
  
  // Manually add an Textarea attribute
  attributeMap['Textarea'] = { sql_data_type: 'nvarchar' };
  attributeMap['Textarea']['akeneo_type'] = akeneo.REFERENCE_ENTITY_TEXTAREA;

    // Manually add an _Number attribute
  attributeMap['_Number'] = { sql_data_type: 'int' };
  attributeMap['_Number']['akeneo_type'] = akeneo.REFERENCE_ENTITY_NUMBER;
  
  return attributeMap;
}

export async function referenceEntityRecords(logger: Logger, conn: any): Promise<any> {
  const methodName: string = 'referenceEntityRecords';
  logger.info({ moduleName, methodName }, `Starting...`);

  const tableName: string = REFERENCE_ENTITY_CODE;
  const loadedImagesMapPath: string = `${exportPath}${path.sep}${tableName}${path.sep}loadedImagesMap.vac`;
  akeneo.mkdirs([ tableName ]);

  if (loadedImagesMap.size === 0) {
    await mapper.load(logger, loadedImagesMapPath, loadedImagesMap, 'Text');
  }

  const results: any = [];
  
  const query: string = `
    SELECT distinct

    FROM   
    ORDER BY 
  `;

  let rows: any[] = [];
  try {
    rows = await sql.executeDML(logger, conn, query);
    logger.info({ moduleName, methodName, rows: rows.length });
  } catch (err) {
    logger.error({ moduleName, methodName, err });
    process.exit(99);
  }
  
  for (const row of rows) {
    const code: string = `${akeneo.attributeCode(row.Text)}_${row._Number}`;
    const label: string = row.Text;
    const image: string = loadedImagesMap.has(row.Text) ? loadedImagesMap.get(row.Text).referenceEntitiesMediaFileCode : '';
    const Textarea: string = row.Textarea;
    const Text: string = row.Text;
    const _Number: string = row._Number;
    const result: any = {
      referenceEntityCode: REFERENCE_ENTITY_CODE,
      code,
      label,
      image,
      Textarea,
      Text,
      _Number
    };
    results.push(result);
  }
  
  return results;
}
