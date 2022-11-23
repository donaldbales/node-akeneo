import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';

import { REFERENCE_ENTITY_CODE } from './helper';
import { getLogger } from '../../logger';
import { ReferenceEntity } from '../../interfaces/ReferenceEntity';
import { ReferenceEntityAttribute } from '../../interfaces/ReferenceEntityAttribute';
import { ReferenceEntityAttributeOption } from '../../interfaces/ReferenceEntityAttributeOption';
import { ReferenceEntityRecord } from '../../interfaces/ReferenceEntityRecord';

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = `referenceEntities/${REFERENCE_ENTITY_CODE}/transform`;

function createImage(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: ReferenceEntityAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.REFERENCE_ENTITY_IMAGE,
    labels: {
      en_US: akeneo.attributeLabel(property)
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    allowed_extensions: []
  };
  results.attribute = attribute;
  return results;
}

function createNumber(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: ReferenceEntityAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.REFERENCE_ENTITY_NUMBER,
    labels: {
      en_US: akeneo.attributeLabel(property)
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    decimals_allowed: true,
    min_value: '0',
    max_value: '99999999999999999999999'

  };
  results.attribute = attribute;
  return results;
}

function createMultiLink(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: ReferenceEntityAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.REFERENCE_ENTITY_MULTIPLE_LINKS,
    labels: {
      en_US: akeneo.attributeLabel(property)
    },
    value_per_channel: false,
    value_per_locale: false,
    is_required_for_completeness: false,
    reference_entity_code: attributeMap[property].reference_entity_code
  };
  results.attribute = attribute;
  return results;
}

function createMultipleOptions(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: ReferenceEntityAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.REFERENCE_ENTITY_MULTIPLE_OPTIONS,
    labels: {
      en_US: akeneo.attributeLabel(property)
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false
  };
  results.attribute = attribute;
  for (const option of attributeMap[property].options) {
    const attributeOption: ReferenceEntityAttributeOption = {
      code: akeneo.attributeCode(option),
      labels: {
        en_US: option
      }
    };
    results.attributeOptions.push(attributeOption);
  }
  return results;
}

function createSingleLink(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: ReferenceEntityAttribute = {
    code: akeneo.attributeCode(property),
    type: 'singlelink',
    labels: {
      en_US: akeneo.attributeLabel(property)
    },
    value_per_channel: false,
    value_per_locale: false,
    reference_entity_code: REFERENCE_ENTITY_CODE,
    is_required_for_completeness: false
  };
  results.attribute = attribute;
  return results;
}

function createSingleOption(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: ReferenceEntityAttribute = {
    code: akeneo.attributeCode(property),
    type: 'single_option',
    labels: {
      en_US: akeneo.attributeLabel(property)
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false
  };
  results.attribute = attribute;
  for (const option of attributeMap[property].options) {
    const attributeOption: ReferenceEntityAttributeOption = {
      code: akeneo.attributeCode(option),
      labels: {
        en_US: akeneo.attributeLabel(option)
      }
    };
    results.attributeOptions.push(attributeOption);
  }
  return results;
}

function createText(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: ReferenceEntityAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.REFERENCE_ENTITY_TEXT,
    labels: {
      en_US: akeneo.attributeLabel(property)
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    is_textarea: false,
    is_rich_text_editor: false,
    validation_rule: 'none',
    max_characters: 255
  };
  results.attribute = attribute;
  return results;
}

function createTextarea(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: ReferenceEntityAttribute = {
    code: akeneo.attributeCode(property),
    type: 'text',
    labels: {
      en_US: akeneo.attributeLabel(property)
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    is_textarea: true,
    is_rich_text_editor: false,
    max_characters: 65535,
    validation_rule: 'none'
  };
  results.attribute = attribute;
  return results;
}

export function referenceEntityAttributes(logger: any, attributeMap: any): any {
  const methodName: string = 'referenceEntityAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  const resultMap: any = {
    attributes: [],
    attributeOptions: []
  };

  for (const property in attributeMap) {
    if (attributeMap.hasOwnProperty(property)) {
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_DATE) {
        const result: any = createText(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_MULTIPLE_LINKS) {
        const result: any = createMultiLink(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_MULTIPLE_OPTIONS) {
        const result: any = createMultipleOptions(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});

        for (const option of result.attributeOptions) {
          const referenceEntityCode: string = REFERENCE_ENTITY_CODE;
          const referenceEntityAttributeCode: string = result.attribute.code;
          const referenceEntityAttributeOptionCode: string = option.code;
          resultMap.attributeOptions.push({
            referenceEntityCode,
            referenceEntityAttributeCode,
            referenceEntityAttributeOptionCode,
            option});
        }
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_NUMBER &&
          attributeMap[property].sql_data_type === 'bit' ) {
        const result: any = createText(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_NUMBER &&
          attributeMap[property].sql_data_type === 'decimal') {
        const result: any = createNumber(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_NUMBER &&
         (attributeMap[property].sql_data_type === 'int' ||
          attributeMap[property].sql_data_type === 'smallint' ||
          attributeMap[property].sql_data_type === 'bigint')) {
        const result: any = createNumber(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_SINGLE_LINK) {
        const result: any = createSingleLink(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_SINGLE_OPTION) {
        const result: any = createSingleOption(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});

        for (const option of result.attributeOptions) {
          const referenceEntityCode: string = REFERENCE_ENTITY_CODE;
          const referenceEntityAttributeCode: string = result.attribute.code;
          const referenceEntityAttributeOptionCode: string = option.code;
          resultMap.attributeOptions.push({
            referenceEntityCode,
            referenceEntityAttributeCode,
            referenceEntityAttributeOptionCode,
            option});
        }
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_TEXT) {
        const result: any = createText(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.REFERENCE_ENTITY_TEXTAREA) {
        const result: any = createTextarea(logger, attributeMap, property);
        resultMap.attributes.push({
          referenceEntityCode: REFERENCE_ENTITY_CODE,
          referenceEntityAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else {
        const msg: string = `add a akeneo mapping for: ` +
          `${attributeMap[property].sql_data_type}` +
          `and ${attributeMap[property].akeneo_type}`;
        logger.error({ moduleName, methodName }, `${msg}`);
        process.exit(99);
      }
    }
  }

  return resultMap;
}

export function referenceEntityRecords(logger: any, extractedRecords: any[]): any[] {
  const methodName: string = 'referenceEntityRecords';
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
        ],
        image: [
          { locale: null,
            channel: null,
            data: extractedRecord.image
          }
        ]
      }
    };
    
    if (extractedRecord.Text) {
      record.values.text = [ {
        locale: null,
        channel: null,
        data: extractedRecord.Text
      } ]; 
    }
    if (extractedRecord.Textarea) {
      record.values.textarea = [ {
        locale: null,
        channel: null,
        data: extractedRecord.Textarea
      } ]; 
    }

    if (extractedRecord._Number) {
      record.values._number = [ {
        locale: null,
        channel: null,
        data: extractedRecord._Number
      } ]; 
    }

    results.push({
      referenceEntityCode: extractedRecord.referenceEntityCode,
      referenceEntityRecordCode: extractedRecord.code,
      record
    });    
  }
    
  return results;
}
