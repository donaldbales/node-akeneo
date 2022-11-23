import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { inspect } from '../inspect';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'categories/extract';

async function categoriesLevel1(logger: Logger, conn: any) {
  const methodName: string = 'categoriesLevel1';
  logger.info({ moduleName, methodName }, `Starting...`);

  let results: any = [];
  const query = `
    SELECT 
    FROM   
    ORDER BY 
 `;

  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results});
  } catch (err) {
    logger.error({ moduleName, methodName, err});
    process.exit(99);
  }

  return results;
}

async function categoriesLevel2(logger: Logger, conn: any) {
  const methodName: string = 'categoriesLevel2';
  logger.info({ moduleName, methodName }, `Starting...`);

  let results: any = [];
  const query = `
    SELECT 
    FROM   
    ORDER BY 
 `;

  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results});
  } catch (err) {
    logger.error({ moduleName, methodName, err});
    process.exit(99);
  }

  return results;
}

async function categoriesLevel3(logger: Logger, conn: any) {
  const methodName: string = 'categoriesLevel3';
  logger.info({ moduleName, methodName }, `Starting...`);

  let results: any = [];

  const query = `
    SELECT 
    FROM   
    ORDER BY 
  `;

  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results});
  } catch (err) {
    logger.error({ moduleName, methodName, err});
    process.exit(99);
  }

  return results;
}

export async function categories(logger: Logger, conn: any) {
  const methodName: string = 'categories';
  logger.info({ moduleName, methodName }, `Starting...`);

  const categoryResultsLevel1: any = await categoriesLevel1(logger, conn);
  const categoryResultsLevel2: any = await categoriesLevel2(logger, conn);
  const categoryResultsLevel3: any = await categoriesLevel3(logger, conn);

  let results: any = [];

  for (const category of categoryResultsLevel1) {
    results.push(category)
  }
  
  for (const category of categoryResultsLevel2) {
    results.push(category);
  }
  
  for (const category of categoryResultsLevel3) {
    results.push(category);
  }
  
  return results;
}
