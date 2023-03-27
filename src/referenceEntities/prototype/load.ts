import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { REFERENCE_ENTITY_CODE } from './helper';
import { inspect } from '../../inspect';
import { getLogger } from '../../logger';
import * as mapper from '../../mapper';
import { ReferenceEntity } from '../../interfaces/ReferenceEntity';
import { ReferenceEntityRecord } from '../../interfaces/ReferenceEntityRecord';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = `referenceEntities/${REFERENCE_ENTITY_CODE}/load`;

const extractedImagesMap: Map<string, any> = new Map();
const loadedImagesMap: Map<string, any> = new Map();

export async function loadImages(logger: Logger, conn: any): Promise<any[]> {
  const methodName: string = 'loadImages';
  logger.info({ moduleName, methodName }, `Starting...`);

  const tableName: string = REFERENCE_ENTITY_CODE;
  const extractedImagesMapPath: string = `${exportPath}${path.sep}${tableName}${path.sep}extractedImagesMap.vac`;
  const loadedImagesMapPath: string = `${exportPath}${path.sep}${tableName}${path.sep}loadedImagesMap.vac`;
  akeneo.mkdirs([ tableName ]);

  if (extractedImagesMap.size === 0) {
    await mapper.load(logger, extractedImagesMapPath, extractedImagesMap, 'PKey');
  }

  if (loadedImagesMap.size === 0) {
    await mapper.load(logger, loadedImagesMapPath, loadedImagesMap, 'PKey');
  }

  const results: any = {};

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

  const referenceEntityCode: string = REFERENCE_ENTITY_CODE;
  let code: string = '';
  let imagePath: string = '';
  let key: string = '';
  let referenceEntitiesMediaFileCode: string = '';
  for (const row of rows) {
    key = row.PKey;
    if (extractedImagesMap.has(key)) {
      const data: any = extractedImagesMap.get(key); 
      code = data.code;
      imagePath = data.imagePath;
      if (!(loadedImagesMap.has(key))) {
        let stream: any = null;
        try {
          stream = fs.createReadStream(imagePath);
        } catch (err) {
          const error: string = err.message ? err.message : inspect(err);
          logger.error({ moduleName, methodName, error }, `opening ${imagePath}.`);
          continue;
        }
        if (stream) {
          try {
            referenceEntitiesMediaFileCode = await akeneo.postMultipartFormData(
              akeneo.apiUrlReferenceEntityMediaFiles(),
              stream);
            stream.close();
          } catch (err) {
            const error: string = err.message ? err.message : inspect(err);
            logger.error({ moduleName, methodName, imagePath, referenceEntitiesMediaFileCode, error }, `loading ${imagePath}.`);
            process.exit(99);
          }          
          delete row.Image;
          row['code'] = code;
          row['imagePath'] = imagePath;
          row['referenceEntitiesMediaFileCode'] = referenceEntitiesMediaFileCode;
          try {
            const file: any = fs.openSync(loadedImagesMapPath, 'a');
            fs.writeSync(file, `${JSON.stringify(row)}\n`);
            fs.closeSync(file);
            logger.info({ moduleName, methodName }, `loaded ${imagePath}.`);
          } catch (err) {
            const error: string = err.message ? err.message : inspect(err);
            logger.error({ moduleName, methodName, loadedImagesMapPath, error }, `writing ${loadedImagesMapPath}.`);
            process.exit(99);
          }
        }
      } else {
        logger.info({ moduleName, methodName, key }, `${imagePath} already loaded.`);
      }
    } else {
      logger.warn({ moduleName, methodName, key }, `Warning: image for ${key} not extracted.`);
    }
  }

  return [ 'OK' ];
}

export async function referenceEntity(logger: any): Promise<any[]> {
  const methodName: string = 'loadReferenceEntity';
  logger.info({ moduleName, methodName }, `Starting...`);

  const referenceEntity_: ReferenceEntity = {
    code: REFERENCE_ENTITY_CODE,
    labels: {
      en_US: 'References',
    }
  };
  
  const results = await akeneo.patch(akeneo.apiUrlReferenceEntities(referenceEntity_.code), referenceEntity_);

  return results;
}

export async function referenceEntityAttributes(logger: any, transformed: any): Promise<any[]> {
  const methodName: string = 'referenceEntityAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  for (const transformedAttribute of transformed.attributes) {
    try {
      const results = await akeneo.patch(
        akeneo.apiUrlReferenceEntityAttributes(
            transformedAttribute.referenceEntityCode,
            transformedAttribute.referenceEntityAttributeCode),
          transformedAttribute.attribute);
      logger.info({ moduleName, methodName, results });    
    } catch (err) {
      logger.error({ moduleName, methodName, error: err });
      process.exit(99);
    } 
  }

  for (const transformedOption of transformed.attributeOptions) {
    try {
      const results = await akeneo.patch(
        akeneo.apiUrlReferenceEntityAttributeOptions(
            transformedOption.referenceEntityCode,
            transformedOption.referenceEntityAttributeCode,
            transformedOption.referenceEntityAttributeOptionCode),
          transformedOption.option);
      logger.info({ moduleName, methodName, results});    
    } catch (err) {
      logger.error({ moduleName, methodName, error: err });
      process.exit(99);
    } 
  }

  return [ 'OK' ];
}

export async function referenceEntityRecords(logger: any, transformedRecords: any[]): Promise<any> {
  const methodName: string = 'referenceEntityRecords';
  logger.info({ moduleName, methodName }, `Starting...`);

  const referenceEntityRecords: any[] = transformedRecords;
  console.log(transformedRecords.length);
  if (referenceEntityRecords.length > 0) {
    let referenceEntityData: ReferenceEntityRecord[] = [];
    let referenceEntityCode: string = referenceEntityRecords[0].referenceEntityCode || '';
    let count: number = 0;
    for (let i = 0; i <= referenceEntityRecords.length; i++) {
      if (i === referenceEntityRecords.length || 
          (count > 0 && count % akeneo.patchLimit === 0) || 
          referenceEntityCode !== referenceEntityRecords[i].referenceEntityCode) {
        const results = await akeneo.patch(
          `${akeneo.apiUrlReferenceEntityRecords(referenceEntityCode)}`,
          referenceEntityData);

        if (i < referenceEntityRecords.length) {
          referenceEntityCode = referenceEntityRecords[i].referenceEntityCode || '';
          referenceEntityData = [];
          count = 0;
        }
      } 
      if (i < referenceEntityRecords.length) {
        referenceEntityData.push(referenceEntityRecords[i].record);
        count++;
      }
    }
  }

  return [ 'OK' ];
}
