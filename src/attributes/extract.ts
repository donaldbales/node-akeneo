import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { inspect } from '../inspect';
import * as setter from '../setter';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

export const defaultGroup: string = 'other';
const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'attributes/extract';

export const ALL: string = '10000000';
export const TOP: string = '1000';

export async function attributes(logger: Logger, conn: any) {
  const methodName: string = 'attributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  const attributeMap: any = {};
  const attributeMapProducts: any = await attributesProducts(logger, conn);
  // ...
  const attributeMapManualOverrides: any = await attributeManualOverrides(logger, conn);

  for (const property in attributeMapProducts) {
    if (attributeMapProducts.hasOwnProperty(property)) {
      attributeMap[property] = attributeMapProducts[property];
    }
  }
  // ...
  for (const property in attributeMapManualOverrides) {
    if (attributeMapManualOverrides.hasOwnProperty(property)) {
      if (attributeMap[property]) {
        if (property === 'Keywords') {
          console.log(`Overriding:`);
          console.log(attributeMap[property]);
          console.log(`with:`);
          console.log(attributeMapManualOverrides[property]);
          process.exit(99);
        }
        //overwrite existing properties, or add new
        const attributeMapOverrideProperties = attributeMapManualOverrides[property];
        for (const attributeMapOverrideProperty in attributeMapOverrideProperties) {
          if (attributeMapOverrideProperties.hasOwnProperty(attributeMapOverrideProperty)) {
            attributeMap[property][attributeMapOverrideProperty] = attributeMapOverrideProperties[attributeMapOverrideProperty];
          }
        }
      } else {
        attributeMap[property] = attributeMapManualOverrides[property];
      }
    }
  }

  const sortedAttributeMap: any = {};
  const sortedProperties: any[] = Object.keys(attributeMap).sort();
  let sort_order: number = 0;
  for (const sortedProperty of sortedProperties) {
    sort_order += 10;
    sortedAttributeMap[sortedProperty] = attributeMap[sortedProperty];
    sortedAttributeMap[sortedProperty].sort_order = sort_order;
  }
  
  return sortedAttributeMap;
}

export async function attributesProducts(logger: Logger, conn: any) {
  const methodName: string = 'attributesProducts';
  logger.info({ moduleName, methodName }, `Starting...`);

  const query: string = `
    select column_name,
           data_type
    from   information_schema.columns
    where  table_name = 'SomeTableName'
    and column_name in (
      'SomeColumnName',
      'AndAnother',
      '...')
    order by column_name;
  `;

  let results: any[] = [];
  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results });
  } catch (err) {
    logger.error({ moduleName, methodName, err, query });
    process.exit(99);
  }

  // Declare a map (we'll use an object as a map this time, with its properties as keys)
  const attributeMap: any = {};

  // Fixing where attributes share column names
  for (const result of results) {
    if (result.column_name === 'xxx') {
      attributeMap['yyy'] = { sql_data_type: result.data_type };
    } else {
      attributeMap[result.column_name] = { sql_data_type: result.data_type };
    }
  }

  // Now there's a map of attribute_names with sql_data_types so all types are properly mapped.
  for (const property in attributeMap) {
    if (attributeMap.hasOwnProperty(property)) {
      // Apply overrides
      //if (attributeOverrides.has(akeneoCode(deQuote(property)))) {
      //  attributeMap[property]['akeneo_type'] = attributeOverrides.get(akeneoCode(deQuote(property)));
      //  logger.info({ moduleName, methodName },
      //    `Overriding "${property}" to use akeneo type: "${inspect(attributeMap[property]['akeneo_type'])}"`);
      //}
      //
      if (attributeMap[property]['akeneo_type'] &&
          attributeMap[property]['akeneo_type'] === akeneo.PIM_CATALOG_MULTISELECT) {
        const options: any[] = await getOptionsProducts(logger, conn, property, ALL);
        attributeMap[property]['options'] = options;
      } else
      if (attributeMap[property]['akeneo_type'] &&
          attributeMap[property]['akeneo_type'] === akeneo.PIM_CATALOG_SIMPLESELECT) {
        const options: any[] = await getOptionsProducts(logger, conn, property, ALL);
        attributeMap[property]['options'] = options;
      } else
      if (attributeMap[property]['akeneo_type'] &&
          attributeMap[property]['akeneo_type'] === akeneo.PIM_CATALOG_PRICE_COLLECTION) {
        // do nothing
      } else
      if (attributeMap[property].sql_data_type === 'uniqueidentifier') {
        attributeMap[property]['akeneo_type'] = akeneo.PIM_CATALOG_TEXT;
      } else
      if (attributeMap[property].sql_data_type === 'char' ||
          attributeMap[property].sql_data_type === 'nchar' ||
          attributeMap[property].sql_data_type === 'nvarchar' ||
          attributeMap[property].sql_data_type === 'varchar') {
        const options: any[] = await getOptionsProducts(logger, conn, property);
        if (options.length > 1) {
          attributeMap[property]['akeneo_type'] = akeneo.PIM_CATALOG_SIMPLESELECT;
          attributeMap[property]['options'] = options;
        } else
        if (await getTextLengthProducts(logger, conn, property) > 255) {
          attributeMap[property]['akeneo_type'] = akeneo.PIM_CATALOG_TEXTAREA;
        } else {
          attributeMap[property]['akeneo_type'] = akeneo.PIM_CATALOG_TEXT;
        }
      } else
      if (attributeMap[property].sql_data_type === 'decimal' ||
          attributeMap[property].sql_data_type === 'int' ||
          attributeMap[property].sql_data_type === 'smallint' ||
          attributeMap[property].sql_data_type === 'bigint') {
        attributeMap[property]['akeneo_type'] = akeneo.PIM_CATALOG_NUMBER;
      } else
      if (attributeMap[property].sql_data_type === 'datetime' ||
          attributeMap[property].sql_data_type === 'date') {
        attributeMap[property]['akeneo_type'] = akeneo.PIM_CATALOG_DATE;
      } else
      if (attributeMap[property].sql_data_type === 'bit') {
        attributeMap[property]['akeneo_type'] = akeneo.PIM_CATALOG_BOOLEAN;
      } else {
        logger.error({ moduleName, methodName }, `Add a mapping for ${property}: ${attributeMap[property].sql_data_type}`);
        process.exit(99);
      }
    }
    attributeMap[property].group = defaultGroup;
    attributeMap[property].localizable = true;
  }

  return attributeMap;
}

// function below to manually override attribute type after the map is created 
// TODO: have this load from a json or csv so a record of the logic is available
async function attributeManualOverrides(logger: Logger, conn: any) {
  const methodName: string = 'attributeManualOverrides';
  logger.info({ moduleName, methodName }, `Starting...`);

  const attributeMap: any = {};

  // Data Source
  attributeMap['DataSource'] = { group: 'other', localizable: true, sql_data_type: 'varchar' };
  attributeMap['DataSource']['akeneo_type'] = akeneo.PIM_CATALOG_TEXT;

  attributeMap['DataSourced'] = { group: 'other', localizable: true, sql_data_type: 'varchar' };
  attributeMap['DataSourced']['akeneo_type'] = akeneo.PIM_CATALOG_TEXT;
  
  return attributeMap;
}

async function getOptionsProducts(logger: Logger, conn: any, property: string, top: string = TOP) {
  const methodName: string = 'getOptionsProducts';
  logger.debug({ moduleName, methodName }, `Starting...`);

  let results: any[] = [];
  // This where the histogram needs to be built so we have good options that are assignable
  let localColumnName = akeneo.deQuote(property);

  // Fixing where attributes share column names
  if (localColumnName === 'yyy'){
    localColumnName = 'xxx';
  } // else ...

  const query: string = `
    SELECT TOP ${top}
           ${localColumnName} COLLATE sql_latin1_general_cp1_cs_as as [${localColumnName}],
           COUNT(1) AS "count"
    FROM   
    WHERE  ${localColumnName} IS NOT NULL
    GROUP BY ${localColumnName} COLLATE sql_latin1_general_cp1_cs_as
    ORDER BY COUNT(1) DESC
  `;

  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results });
  } catch (err) {
    logger.error({ moduleName, methodName, err, query });
    process.exit(99);
  }

  // Getting the options from the results so we are able to get not only 
  // the options, but also ones that are non-unique
  const options: any[] = [];
  let countGreaterThanOne: number = 0;
  if (results.length > 0 && 
      results.length < Number.parseInt(top, 10)) {
    for (const result of results) {
      if (result[localColumnName]) {
        options.push(result[localColumnName]);
        if (result.count > 1) {
          countGreaterThanOne++;
        }
      }
    }
  }

  if (countGreaterThanOne > 1 || top === ALL) {
    return options;
  } else {
    return [];
  }
}

async function getTextLengthProducts(logger: Logger, conn: any, property: string) {
  const methodName: string = 'getTextLengthProducts';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const localColumnName: string = akeneo.deQuote(property);

  let result: number;

  // This where the text length in a column is measured to see if it is text or textarea
  const query: string = `
    SELECT MAX(LEN(${localColumnName})) as "max_column_length"
    FROM   
  `;

  let results: any[] = [];
  try {
    results = await sql.executeDML(logger, conn, query);
    logger.debug({ moduleName, methodName, results });
  } catch (err) {
    logger.error({ moduleName, methodName, err, query });
    process.exit(99);
  }

  // Get one row and only one with a column for max characters
  return results[0].max_column_length;
}
