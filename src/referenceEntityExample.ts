// referenceEntityExample.ts

import Logger from 'bunyan';

import * as akeneo from './akeneo';
import * as http from './http';
import { getLogger } from './logger';
import { ReferenceEntity } from './interfaces/ReferenceEntity';
import { ReferenceEntityAttribute } from './interfaces/ReferenceEntityAttribute';
import { ReferenceEntityAttributeOption } from './interfaces/ReferenceEntityAttributeOption';
import { ReferenceEntityRecord } from './interfaces/ReferenceEntityRecord';

const moduleName: string = 'referenceEntityExample';
const EXAMPLE_CODE: string = 'example';

//
// STEP 1: Load the reference entity
//
async function loadReferenceEntity(logger: Logger): Promise<any[]> {
  const methodName: string = 'loadExample';
  logger.info({ moduleName, methodName }, `Starting...`);

  const referenceEntity: ReferenceEntity = {
    code: EXAMPLE_CODE,
    labels: {
      en_US: 'Example'
    }
  };
  
  const results = await http.patch(akeneo.apiUrlReferenceEntities(referenceEntity.code), referenceEntity);

  return results;
}

//
// STEP 2: Extract, Transform, and Load (ETL) the attributes and their options
//
function extractReferenceEntityAttributes(logger: Logger, referenceEntityCode: string = EXAMPLE_CODE): any {
  const methodName: string = 'extractReferenceEntityAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  const resultMap: any = {
    attributes: [],
    options: []
  }
  
  let attribute: any;
  attribute = { 
    referenceEntityCode,
    code: 'referenceentitysingleoption',
    label: 'Reference Entity Single Option' 
  };
  resultMap.attributes.push(attribute);
  
  let option: any;
  option = {
    referenceEntityCode: attribute.referenceEntityCode,
    referenceEntityAttributeCode: attribute.code,
    code: 'referenceentitysingleoptionone',
    label: 'Reference Entity Single Option One'
  }
  resultMap.options.push(option);

  option = {
    referenceEntityCode: attribute.referenceEntityCode,
    referenceEntityAttributeCode: attribute.code,
    code: 'referenceentitysingleoptiontwo',
    label: 'Reference Entity Single Option Two'
  }
  resultMap.options.push(option);
  
  return resultMap;
}

function transformReferenceEntityAttributes(logger: Logger, extracted: any): any {
  const methodName: string = 'transformReferenceEntityAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  const resultMap: any = {
    attributes: [],
    options: []
  }
  
  for (const extractedAttribute of extracted.attributes) {
    const attribute: ReferenceEntityAttribute = {
      code: extractedAttribute.code,
      labels: {
        en_US: extractedAttribute.label
      },
      type: 'single_option',
      value_per_locale: false,
      value_per_channel: false,
      is_required_for_completeness: false
    };
    
    resultMap.attributes.push({
      referenceEntityCode: extractedAttribute.referenceEntityCode,
      referenceEntityAttributeCode: attribute.code,
      attribute
    });
  }

  for (const extractedOption of extracted.options) {
    const option: ReferenceEntityAttributeOption = {
      code: extractedOption.code,
      labels: {
        en_US: extractedOption.label
      }
    };
    
    resultMap.options.push({
      referenceEntityCode: extractedOption.referenceEntityCode,
      referenceEntityAttributeCode: extractedOption.referenceEntityAttributeCode,
      referenceEntityAttributeOptionCode: option.code,
      option
    });
  }

  return resultMap;
}

async function loadReferenceEntityAttributes(logger: Logger, transformed: any): Promise<any[]> {
  const methodName: string = 'loadReferenceEntityAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  for (const transformedAttribute of transformed.attributes) {
    try {
      const results = await http.patch(
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

  for (const transformedOption of transformed.options) {
    try {
      const results = await http.patch(
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

//
// STEP 3: Extract, Transform, and Load (ETL) Records
//
function extractReferenceEntityRecords(logger: Logger, referenceEntityCode: string = EXAMPLE_CODE): any {
  const methodName: string = 'extractReferenceEntityRecords';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any = [];
  let result: any;
  
  result = {
    referenceEntityCode,
    code: 'examplerecordone',
    label: 'Example Record One',
    referenceentitysingleoption: 'referenceentitysingleoptiontwo'
  };
  results.push(result);
  
  result = {
    referenceEntityCode,
    code: 'examplerecordtwo',
    label: 'Example Record Two'
  };
  results.push(result);

  result = {
    referenceEntityCode,
    code: 'examplerecordthree',
    label: 'Example Record Three',
    referenceentitysingleoption: 'referenceentitysingleoptionone'
  };
  results.push(result);
    
  return results;
}

function transformReferenceEntityRecords(logger: Logger, extractedRecords: any[]): any[] {
  const methodName: string = 'transformReferenceEntityRecords';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any = [];
  let record: any;
  
  for (const extractedRecord of extractedRecords) {
    record = {
      code: extractedRecord.code,
      values: {
        label: [
          { 
            locale: 'en_US',
            channel: null,
            data: extractedRecord.label
          }
        ]
      }
    };
    if (extractedRecord.referenceentitysingleoption) {
      record['values']['referenceentitysingleoption'] = [
        {
          locale: null,
          channel: null,
          data: extractedRecord.referenceentitysingleoption
        }
      ];
    }
    results.push({
      referenceEntityCode: extractedRecord.referenceEntityCode,
      referenceEntityRecordCode: extractedRecord.referenceEntityRecordCode,
      record
    });
  }
    
  return results;
}

async function loadReferenceEntityRecords(logger: Logger, transformedRecords: any[]): Promise<any> {
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
        const results = await http.patch(
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

async function main(): Promise<any> {
  const methodName: string = 'main';
  const logger = getLogger('referenceEntityExample');
  logger.info({ moduleName, methodName }, `Starting...`);

  let results: any = null;
  
  results = await loadReferenceEntity(logger);
  
  results =       extractReferenceEntityAttributes(logger, EXAMPLE_CODE);
  results =       transformReferenceEntityAttributes(logger, results);
  results = await loadReferenceEntityAttributes(logger, results);
  
  results =       extractReferenceEntityRecords(logger, EXAMPLE_CODE);
  results =       transformReferenceEntityRecords(logger, results);
  results = await loadReferenceEntityRecords(logger, results);
  
  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 3000);
  }

  logger.info({ moduleName, methodName }, `Ending.`);
}

// Start the program
if (require.main === module) {
  main();
}
