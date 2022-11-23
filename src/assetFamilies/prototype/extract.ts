import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';
import { URL } from 'url';

import { ASSET_FAMILY_CODE } from './helper';
import { exec } from '../../executor';
import { inspect } from '../../inspect';
import { getLogger } from '../../logger';
import * as mapper from '../../mapper';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = `assetFamilies/${ASSET_FAMILY_CODE}/extract`;

const imagesExtractedMap: Map<string, any> = new Map();
const imagesLoadedMap: Map<string, any> = new Map();

async function head(logger: Logger, url: string): Promise<any> {
  const methodName: string = 'head';
  logger.info({ moduleName, methodName }, `HEAD ${url}`);

  const command: string = `curl --connect-timeout 1 --head -m 2 -s '${url}' | grep -i -e 'HTTP\/' -e 'content-type: ' -e 'location: '`;
  const fileResults: any = await exec(logger, command);
  console.log(fileResults);

  let results = { statusCode: 500, headers: { 'content-type': 'unknown' } };

  if (fileResults.code === 0) {
    const lines: string[] = fileResults.stdout[0].toString().split('\n');
    const statusCode: number = Number.parseInt(lines[0].split(' ')[1].trim(), 10);
    const headers: any = {}
    if (lines[1] &&
        lines[1].split(': ')[0] &&
        lines[1].split(': ')[0].trim() &&
        lines[1].split(': ')[1].trim()) {
      headers[lines[1].split(': ')[0].trim().toLowerCase()] = lines[1].split(': ')[1].trim();
    }
    if (lines[2] &&
        lines[2].split(': ')[0] &&
        lines[2].split(': ')[0].trim() &&
        lines[2].split(': ')[1].trim()) {
      headers[lines[2].split(': ')[0].trim().toLowerCase()] = lines[2].split(': ')[1].trim();
    }
    results = { statusCode, headers }
  }
  console.log(results);

  return results;
}

export async function extractImages(logger: Logger, conn: any, startPKey: string = '', endPKey: string = ''): Promise<any[]> {
  const methodName: string = 'extractImages';
  logger.info({ moduleName, methodName }, `Starting...`);

  const tableName: string = 'Images';
  const extractedMapPath: string = `${exportPath}${path.sep}${tableName}${path.sep}extractedMap.vac`;

  if (imagesExtractedMap.size === 0) {
    await mapper.load(logger, extractedMapPath, imagesExtractedMap, 'eyedee');
  }

  return [];
}

export function assetFamilyAttributes(logger: Logger): any {
  const methodName: string = 'assetFamilyAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  const attributeMap: any = {};
  
  // code, label, media are standard attributes for an asset family
  
  // Manually add a Text attribute
  attributeMap['Text'] = { sql_data_type: 'nvarchar' };
  attributeMap['Text']['akeneo_type'] = akeneo.ASSET_FAMILY_TEXT;
  
  // Manually add a Textarea attribute
  attributeMap['Textarea'] = { sql_data_type: 'nvarchar' };
  attributeMap['Textarea']['akeneo_type'] = akeneo.ASSET_FAMILY_TEXTAREA;
  
  // Manually add a transformation attribute
  attributeMap['Media100x100'] = {};
  attributeMap['Media100x100']['akeneo_type'] = akeneo.ASSET_FAMILY_MEDIA_FILE;
  
  return attributeMap;
}

export async function assetFamilyAssets(logger: Logger, conn: any, startPKey: string = '', endPKey: string = ''): Promise<any> {
  const methodName: string = 'assetFamilyAssets';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any = [];
  
  const tableName: string = 'Images';
  const loadedMapPath: string = `${exportPath}${path.sep}${tableName}${path.sep}loadedMap.vac`;

  if (imagesLoadedMap.size === 0) {
    await mapper.load(logger, loadedMapPath, imagesLoadedMap, 'eyedee');
  }

  const query: string = `
    SELECT eyedee,
    FROM   
    WHERE  eyedee between '${startPKey}' and '${endPKey}'
    order by 1 desc;
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
    if (imagesLoadedMap.has(row.eyedee)) {
      const code: string = akeneo.attributeCode(row.eyedee);
      const label: string = row.Text;
      const media: string = imagesLoadedMap.get(row.eyedee).assetFamiliesMediaFileCode;
      const Text: string = row.Text;
      const Textarea: string = row.Textarea;
      const result: any = {
        assetFamilyCode: ASSET_FAMILY_CODE,
        code,
        label,
        media,
        Text,
        Textarea
      };

      results.push(result);
      logger.info({ moduleName, methodName, code, media }, `Added to Assets`);
    }
  }

  return results;
}
