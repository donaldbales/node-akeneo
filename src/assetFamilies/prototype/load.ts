import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { ASSET_FAMILY_CODE } from './helper';
import { AssetFamily } from '../../interfaces/AssetFamily';
import { AssetFamilyAsset } from '../../interfaces/AssetFamilyAsset';
import { inspect } from '../../inspect';
import { getLogger } from '../../logger';
import * as mapper from '../../mapper';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = `assetFamilies/${ASSET_FAMILY_CODE}/load`;

const imagesExtractedMap: Map<string, any> = new Map();
const imagesLoadedMap: Map<string, any> = new Map();

export async function loadImages(logger: Logger, conn: any, startPKey: string = '', endPKey: string = ''): Promise<any[]> {
  const methodName: string = 'loadImages';
  logger.info({ moduleName, methodName }, `Starting...`);

  const tableName: string = 'Images';
  const extractedMapPath: string = `${exportPath}${path.sep}${tableName}${path.sep}extractedMap.vac`;
  const loadedMapPath: string = `${exportPath}${path.sep}${tableName}${path.sep}loadedMap.vac`;

  if (imagesExtractedMap.size === 0) {
    await mapper.load(logger, extractedMapPath, imagesExtractedMap, 'eyedee');
  }

  if (imagesLoadedMap.size === 0) {
    await mapper.load(logger, loadedMapPath, imagesLoadedMap, 'eyedee');
  }

  const query: string = `
    SELECT i.eyedee
    FROM   Images i
    where  i.eyedee between '${startPKey}' and '${endPKey}'
    order by 1
  `;

  let rows: any[] = [];
  try {
    rows = await sql.executeDML(logger, conn, query);
    logger.info({ moduleName, methodName, rows: rows.length });
  } catch (err) {
    logger.error({ moduleName, methodName, err });
    process.exit(99);
  }

  let assetFamiliesMediaFileCode: string = '';
  let imagePath: string = '';
  for (const row of rows) {
    const key: string = row.eyedee;
    if (imagesExtractedMap.has(key)) {
      const data: any = imagesExtractedMap.get(key);
      imagePath = data.imagePath;
      const updated_at: string = 
        imagesLoadedMap.get(key) &&
        imagesLoadedMap.get(key).updated_at ? 
        imagesLoadedMap.get(key).updated_at : 
        '1900-01-01T00:00:00.000Z';
      if (!(imagesLoadedMap.has(key)) ||
        updated_at < data.updated_at) {
        const eyedee: string = data.eyedee;
        const updated_at: string = data.updated_at;
        let stream: any = null;
        try {
          stream = fs.createReadStream(imagePath);
        } catch (err) {
          const error: string = err.message ? err.message : inspect(err);
          logger.error({ moduleName, methodName, error }, `opening ${imagePath}.`);
          stream = '';
        }
        if (stream) {
          try {
            assetFamiliesMediaFileCode = '';
            assetFamiliesMediaFileCode = await akeneo.postMultipartFormData(
              akeneo.apiUrlAssetFamilyMediaFiles(),
              stream);
            logger.info({ moduleName, methodName, imagePath, assetFamiliesMediaFileCode });
          } catch (err) {
            const error: string = err.message ? err.message : inspect(err);
            logger.error({ moduleName, methodName, imagePath, assetFamiliesMediaFileCode, error }, `loading ${imagePath}.`);
            assetFamiliesMediaFileCode = '';
          }
          if (stream.close) {
            stream.close();
          }
          if (assetFamiliesMediaFileCode) {
            const row: any = {
              eyedee,
              updated_at,
              assetFamiliesMediaFileCode
            };
            try {
              const file: any = fs.openSync(loadedMapPath, 'a');
              fs.writeSync(file, `${JSON.stringify(row)}\n`);
              fs.closeSync(file);
              logger.info({ moduleName, methodName }, `loaded ${imagePath}.`);
            } catch (err) {
              const error: string = err.message ? err.message : inspect(err);
              logger.error({ moduleName, methodName, loadedMapPath, error }, `writing ${loadedMapPath}.`);
              process.exit(99);
            }
          }
        }
      } else {
        logger.info({ moduleName, methodName }, `${imagePath} already loaded.`);
      }
    } else {
      logger.warn({ moduleName, methodName }, `Warning: image for ${key} NOT extracted.`);    
    }
  }
  return [ 'OK' ];
}

export async function assetFamily(logger: any): Promise<any[]> {
  const methodName: string = 'assetFamily';
  logger.info({ moduleName, methodName }, `Starting...`);

  const assetFamily_: AssetFamily = {
    code: ASSET_FAMILY_CODE,
    labels: {
      en_US: 'Images'
    }
  };
  
  const results = await akeneo.patch(akeneo.apiUrlAssetFamilies(assetFamily_.code), assetFamily_);

  return results;
}

export async function assetFamilyAttributes(logger: any, transformed: any): Promise<any[]> {
  const methodName: string = 'assetFamilyAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  for (const transformedAttribute of transformed.attributes) {
    try {
      const results = await akeneo.patch(
        akeneo.apiUrlAssetFamilyAttributes(
            transformedAttribute.assetFamilyCode,
            transformedAttribute.assetFamilyAttributeCode),
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
        akeneo.apiUrlAssetFamilyAttributeOptions(
            transformedOption.assetFamilyCode,
            transformedOption.assetFamilyAttributeCode,
            transformedOption.assetFamilyAttributeOptionCode),
          transformedOption.option);
      logger.info({ moduleName, methodName, results});    
    } catch (err) {
      logger.error({ moduleName, methodName, error: err });
      process.exit(99);
    } 
  }

  return [ 'OK' ];
}

export async function assetFamilyAssets(logger: any, transformedAssets: any[]): Promise<any> {
  const methodName: string = 'assetFamilyAssets';
  logger.info({ moduleName, methodName }, `Starting...`);

  const assetFamilyAssets: any[] = transformedAssets;
  console.log(transformedAssets.length);
  if (assetFamilyAssets.length > 0) {
    let assetFamilyData: AssetFamilyAsset[] = [];
    let assetFamilyCode: string = assetFamilyAssets[0].assetFamilyCode || '';
    let count: number = 0;
    for (let i = 0; i <= assetFamilyAssets.length; i++) {
      if (i === assetFamilyAssets.length || 
          (count > 0 && count % akeneo.patchLimit === 0) || 
          assetFamilyCode !== assetFamilyAssets[i].assetFamilyCode) {
        const results = await akeneo.patch(
          `${akeneo.apiUrlAssetFamilyAssets(assetFamilyCode)}`,
          assetFamilyData);

        if (i < assetFamilyAssets.length) {
          assetFamilyCode = assetFamilyAssets[i].assetFamilyCode || '';
          assetFamilyData = [];
          count = 0;
        }
      } 
      if (i < assetFamilyAssets.length) {
        assetFamilyData.push(assetFamilyAssets[i].asset);
        count++;
      }
    }
  }

  return [ 'OK' ];
}
 