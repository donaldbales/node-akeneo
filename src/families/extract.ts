import Logger from 'bunyan';
import * as fs from 'fs';
import * as path from 'path';

import { getLogger } from '../logger';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'families/extract';

export async function families(logger: Logger, conn: any): Promise<any> {
  const methodName: string = 'families';
  logger.info({ moduleName, methodName }, `Starting...`);

  const familyMap: any = {};
  const familyMapProducts: any = await familiesProducts(logger, conn);
  //...

  fs.writeFileSync(`${exportPath}${path.sep}familyMapProducts.json`,
    JSON.stringify(familyMapProducts).toString().replace(/},"/g, `},\n"`));
  //...	    
  const familyMapOverrides: any = await familiesOverrides(logger, conn);
  fs.writeFileSync(`${exportPath}${path.sep}familyMapOverrides.json`,
    JSON.stringify(familyMapOverrides).toString().replace(/},"/g, `},\n"`));
  
  for (const family in familyMapProducts) {
    if (familyMapProducts.hasOwnProperty(family)) {
      familyMap[family] = {};
      for (const property in familyMapProducts[family]) {
        if (familyMapProducts[family].hasOwnProperty(property) &&
            familyMapProducts[family][property] > 0) {
          familyMap[family][property] = familyMapProducts[family][property]; 
        }
      }
    }
  }
  
  for (const family in familyMapOverrides) {
    if (familyMapOverrides.hasOwnProperty(family)) {
      if (!(familyMap[family])) {
        familyMap[family] = {};
      }
      for (const property in familyMapOverrides[family]) {
        if (familyMapOverrides[family].hasOwnProperty(property) &&
            familyMapOverrides[family][property] > 0) {
          if (!(familyMap[family][property])) {
            familyMap[family][property] = familyMapOverrides[family][property]; 
          } else {
            console.error(`Attribute Name collision: ${property} in FamilyMapOverrides`);
          }
        }
      }
    }
  }

  fs.writeFileSync(`${exportPath}${path.sep}familyMap.json`, JSON.stringify(familyMap).toString().replace(/},"/g, `},\n"`));
  
  return familyMap;
}

export async function familiesProducts(logger: Logger, conn: any): Promise<any> {
  const methodName: string = 'familiesProducts';
  logger.info({ moduleName, methodName }, `Starting...`);
  
  const query: string = `
    SELECT ISNULL(c.Name, 'Default') COLLATE sql_latin1_general_cp1_cs_as as "family_name",
           COUNT(NULLIF(CAST(p.SomeColumnName as varchar(800)), '')) as "SomeColumnName",
           COUNT(NULLIF(CAST(p.AndAnother as varchar(800)), '')) as "AndAnother"
    FROM   
    GROUP BY ISNULL(c.Name, 'Default') COLLATE sql_latin1_general_cp1_cs_as
    ORDER BY ISNULL(c.Name, 'Default') COLLATE sql_latin1_general_cp1_cs_as;
  `;

  let results: any[] = [];
  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results });
  } catch (err) {
    logger.error({ moduleName, methodName, err });
    process.exit(99);
  }

  const familyMap: any = {};
  for (const result of results) {
    familyMap[result.family_name] = {};
    for (const property in result) {
      if (result.hasOwnProperty(property) &&
          property !== 'family_name') {
        familyMap[result.family_name][property] = result[property];
      }
    }
  }

  return familyMap;
}

export async function familiesOverrides(logger: Logger, conn: any) {
  const methodName: string = 'familiesOverrides';
  logger.info({ moduleName, methodName }, `Starting...`);
  
  const query: string = `
	SELECT ISNULL(c.Name, 'Default') COLLATE sql_latin1_general_cp1_cs_as AS  "family_name",
	       99999 as "AndAThirdColumn"
	FROM   
	GROUP BY ISNULL(c.Name, 'Default') COLLATE sql_latin1_general_cp1_cs_as
	ORDER BY ISNULL(c.Name, 'Default') COLLATE sql_latin1_general_cp1_cs_as;
  `;

  let results: any[] = [];
  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results });
  } catch (err) {
    logger.error({ moduleName, methodName, err });
    process.exit(99);
  }

  const familyMap: any = {};
  for (const result of results) {
    familyMap[result.family_name] = {};
    for (const property in result) {
      if (result.hasOwnProperty(property) &&
          property !== 'family_name') {
        familyMap[result.family_name][property] = result[property];
      }
    }
  }

  return familyMap;
}
