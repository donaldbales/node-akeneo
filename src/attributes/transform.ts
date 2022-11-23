import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { inspect } from '../inspect';
import { Attribute } from '../interfaces/Attribute';
import { AttributeBoolean } from '../interfaces/AttributeBoolean';
import { AttributeDate } from '../interfaces/AttributeDate';
import { AttributeNumber } from '../interfaces/AttributeNumber';
import { AttributeOption } from '../interfaces/AttributeOption';
import { AttributePriceCollection } from '../interfaces/AttributePriceCollection';
import { AttributeSimpleselect } from '../interfaces/AttributeSimpleselect';
import { AttributeText } from '../interfaces/AttributeText';
import { AttributeTextarea } from '../interfaces/AttributeTextarea';

export let defaultGroup: string = 'other';

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'attributes/transform';

export function createAssetCollection(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createAssetCollection';
  logger.debug({ moduleName, methodName }, `Starting...`);

  if (!(attributeMap[property]['reference_data_name'])) {
    logger.error({ moduleName, methodName, data: attributeMap[property] }, `missing reference_data_name`);
    process.exit(99);
  }

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute = {
    code,
    type: akeneo.PIM_CATALOG_ASSET_COLLECTION,
    group,
    unique,
    useable_as_grid_filter,
    reference_data_name: attributeMap[property]['reference_data_name'],
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
    // is_read_only: false
  };
  results.attribute = attribute;

  return results;
}

// A.K.A. Yes/No
export function createBoolean(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createBoolean';
  logger.debug({ moduleName, methodName }, `Starting...`);

  return createYesNo(logger, attributeMap, property);
}

export function createDate(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createDate';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributeDate = {
    code,
    type: akeneo.PIM_CATALOG_DATE,
    group,
    unique,
    useable_as_grid_filter,
    available_locales,
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
  };
  if (attributeMap[property]['date_min']) {
    attribute.date_min = attributeMap[property]['date_min'];
  }
  if (attributeMap[property]['date_max']) {
    attribute.date_max = attributeMap[property]['date_max'];
  }
  results.attribute = attribute;

  return results;
}

// TODO: createFile()
/*
{"code":"file_attribute_code",
 "type":"pim_catalog_file",
 "group":"other",
 "unique":false,
 "useable_as_grid_filter":false,
 "allowed_extensions":["csv",
 "txt"],
 "available_locales":["en_US"],
 "max_file_size":"9999.99",
 "sort_order":0,
 "localizable":true,
 "scopable":true,
 "labels":{"en_US":"File"}
}
*/

// TODO: createImage()
/*
{"code":"image_attribute_code",
 "type":"pim_catalog_image",
 "group":"other",
 "unique":false,
 "useable_as_grid_filter":false,
 "allowed_extensions":["jpeg",
 "png"],
 "available_locales":["en_US"],
 "max_file_size":"9999.99",
 "sort_order":0,
 "localizable":true,
 "scopable":true,
 "labels":{"en_US":"Image"}
}
*/

// TODO: createMeasurement()
/*
{"code":"measurement_attribute_code",
 "type":"pim_catalog_metric",
 "group":"other",
 "unique":false,
 "useable_as_grid_filter":false,
 "allowed_extensions":[],
 "metric_family":"Length",
 "default_metric_unit":"INCH",
 "available_locales":["en_US"],
 "number_min":"-9999999999.0000",
 "number_max":"9999999999.0000",
 "decimals_allowed":true,
 "negative_allowed":true,
 "sort_order":0,
 "localizable":true,
 "scopable":true,
 "labels":{"en_US":"Measurement"}
}
*/

export function createMultiselect(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createMultiselect';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {},
    attributeOptions: []
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributeSimpleselect = {
    code,
    type: akeneo.PIM_CATALOG_MULTISELECT,
    group,
    unique,
    useable_as_grid_filter,
    minimum_input_length: 3,
    sort_order,
    localizable,
    scopable,
    available_locales,
    labels: {en_US: label},
    auto_option_sorting: true
  };
  results.attribute = attribute;
  for (const option of attributeMap[property].options) {
    const attributeOption: AttributeOption = {
      code: akeneo.attributeCode(option),
      attribute: akeneo.attributeCode(property),
      sort_order: 0,
      labels: {en_US: option}
    };
    results.attributeOptions.push(attributeOption);
  }

  return results;
}

export function createNumberDecimal(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createNumberDecimal';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributeNumber = {
    code,
    type: akeneo.PIM_CATALOG_NUMBER,
    group,
    unique,
    useable_as_grid_filter,
    available_locales,
    decimals_allowed: true,
    negative_allowed: true,
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
  };
  if (attributeMap[property]['number_min'] !== null) {
    attribute.number_min = attributeMap[property]['number_min'];
  }
  if (attributeMap[property]['number_max'] !== null) {
    attribute.number_max = attributeMap[property]['number_max'];
  }
  results.attribute = attribute;

  return results;
}

export function createNumberInt(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createNumberInt';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributeNumber = {
    code,
    type: akeneo.PIM_CATALOG_NUMBER,
    group,
    unique,
    useable_as_grid_filter,
    available_locales,
    decimals_allowed: false,
    negative_allowed: true,
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
  };
  if (attributeMap[property]['number_min'] !== null) {
    attribute.number_min = attributeMap[property]['number_min'];
  }
  if (attributeMap[property]['number_max'] !== null) {
    attribute.number_max = attributeMap[property]['number_max'];
  }
  results.attribute = attribute;

  return results;
}

export function createPriceCollection(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createPriceCollection';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributePriceCollection = {
    code,
    type: akeneo.PIM_CATALOG_PRICE_COLLECTION,
    group,
    unique,
    useable_as_grid_filter,
    available_locales,
    decimals_allowed: true,
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
  };
  if (attributeMap[property]['number_min'] !== null) {
    attribute.number_min = attributeMap[property]['number_min'];
  }
  if (attributeMap[property]['number_max'] !== null) {
    attribute.number_max = attributeMap[property]['number_max'];
  }
  results.attribute = attribute;

  return results;
}

export function createReferenceEntity(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createReferenceEntity';
  logger.debug({ moduleName, methodName }, `Starting...`);

  if (!(attributeMap[property]['reference_data_name'])) {
    logger.error({ moduleName, methodName, data: attributeMap[property] }, `missing reference_data_name`);
    process.exit(99);
  }

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {},
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute = {
    code,
    type: akeneo.AKENEO_REFERENCE_ENTITY,
    group,
    unique,
    useable_as_grid_filter,
    reference_data_name: attributeMap[property]['reference_data_name'],
    available_locales,
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
  };
  results.attribute = attribute;

  return results;
}

export function createReferenceEntityCollection(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createReferenceEntityCollection';
  logger.debug({ moduleName, methodName }, `Starting...`);

  if (!(attributeMap[property]['reference_data_name'])) {
    logger.error({ moduleName, methodName, data: attributeMap[property] }, `missing reference_data_name`);
    process.exit(99);
  }

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute = {
    code,
    type: akeneo.AKENEO_REFERENCE_ENTITY_COLLECTION,
    group,
    unique,
    useable_as_grid_filter,
    reference_data_name: attributeMap[property]['reference_data_name'],
    available_locales,
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
  };
  results.attribute = attribute;

  return results;
}

export function createSimpleselect(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createSimpleSelect';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {},
    attributeOptions: []
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributeSimpleselect = {
    code,
    type: akeneo.PIM_CATALOG_SIMPLESELECT,
    group,
    unique,
    useable_as_grid_filter,
    available_locales,
    minimum_input_length: 3,
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label},
    auto_option_sorting: true
  };
  results.attribute = attribute;
  for (const option of attributeMap[property].options) {
    const attributeOption: AttributeOption = {
      code: akeneo.attributeCode(option),
      // tslint:disable-next-line: object-literal-sort-keys
      attribute: akeneo.attributeCode(property),
      sort_order: 0,
      labels: {
        en_US: option
      }
    };
    results.attributeOptions.push(attributeOption);
  }
  return results;
}

export function createText(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createText';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributeText = {
    code,
    type: akeneo.PIM_CATALOG_TEXT,
    group,
    unique,
    useable_as_grid_filter: true,
    available_locales,
    max_characters: 255, // max: 65,535
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
  };
  if (attributeMap[property]['validation_regexp'] !== null) {
    attribute.validation_regexp = attributeMap[property]['validation_regexp'];
  }
  if (attributeMap[property]['validation_rule'] !== null) {
    attribute.validation_rule = attributeMap[property]['validation_rule'];
  }
  results.attribute = attribute;

  return results;
}

export function createTextarea(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createTextArea';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributeTextarea = {
    code,
    type: akeneo.PIM_CATALOG_TEXTAREA,
    labels: {en_US: label},
    group,
    unique,
    useable_as_grid_filter,
    available_locales,
    max_characters: 65535, // max: 1,073,741,824 (1GB)
    sort_order,
    localizable,
    scopable,
    wysiwyg_enabled: attributeMap[property]['wysiwyg_enabled'] ? true : false
  };
  results.attribute = attribute;

  return results;
}

export function createYesNo(logger: Logger, attributeMap: any, property: string) {
  const methodName: string = 'createYesNo';
  logger.debug({ moduleName, methodName }, `Starting...`);

  const available_locales: any[] = attributeMap[property]['available_locales'] ? attributeMap[property]['available_locales'] : [];
  const code: string = akeneo.deQuote(property) === property ? akeneo.attributeCode(property) : akeneo.attributeCode(akeneo.deQuote(property));
  const group: string = attributeMap[property]['group'] ? attributeMap[property]['group'] : defaultGroup;
  const label: string = akeneo.deQuote(property) === property ? akeneo.attributeLabel(property) : akeneo.deQuote(property);
  const localizable: boolean = attributeMap[property]['localizable'] ? true : false;
  const results: any = {
    attribute: {}
  };
  const scopable: boolean = attributeMap[property]['scopable'] ? true : false;
  const sort_order: number = attributeMap[property]['sort_order'] ? attributeMap[property]['sort_order'] : 0;
  const unique: boolean = attributeMap[property]['unique'] ? true : false;
  const useable_as_grid_filter: boolean = attributeMap[property]['useable_as_grid_filter'] ? true : false;

  const attribute: AttributeBoolean = {
    code,
    type: akeneo.PIM_CATALOG_BOOLEAN,
    group,
    unique,
    useable_as_grid_filter,
    available_locales,
    sort_order,
    localizable,
    scopable,
    labels: {en_US: label}
  };
  if (attributeMap[property]['default_value'] !== null) {
    attribute.default_value = attributeMap[property]['default_value'];
  }
  results.attribute = attribute;

  return results;
}

export function attributes(logger: Logger, attributeMap: any) {
  const methodName: string = 'attributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any = {
    attributes: [],
    attributeOptions: []
  };

  for (const property in attributeMap) {
    let sqlDataType: string = 'varchar';
    if (attributeMap[property].sql_data_type  &&
        attributeMap[property].sql_data_type.toLowerCase) {
      sqlDataType = attributeMap[property].sql_data_type.toLowerCase();
    }
    if (attributeMap.hasOwnProperty(property)) {
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_ASSET_COLLECTION) {
        const result: any = createAssetCollection(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_BOOLEAN) {
        const result: any = createBoolean(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_DATE) {
        const result: any = createDate(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_MULTISELECT) {
        const result: any = createMultiselect(logger, attributeMap, property);
        results.attributes.push(result.attribute);
        for (const attributeOption of result.attributeOptions) {
          results.attributeOptions.push(attributeOption);
        }
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_NUMBER &&
          sqlDataType === 'decimal') {
        const result: any = createNumberDecimal(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_NUMBER &&
         (sqlDataType === 'int' ||
          sqlDataType === 'smallint' ||
          sqlDataType === 'bigint')) {
        const result: any = createNumberInt(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_PRICE_COLLECTION) {
        const result: any = createPriceCollection(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.AKENEO_REFERENCE_ENTITY) {
        const result: any = createReferenceEntity(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.AKENEO_REFERENCE_ENTITY_COLLECTION) {
        const result: any = createReferenceEntityCollection(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_SIMPLESELECT) {
        const result: any = createSimpleselect(logger, attributeMap, property);
        results.attributes.push(result.attribute);
        for (const attributeOption of result.attributeOptions) {
          results.attributeOptions.push(attributeOption);
        }
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_TEXT) {
        const result: any = createText(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else
      if (attributeMap[property].akeneo_type === akeneo.PIM_CATALOG_TEXTAREA) {
        const result: any = createTextarea(logger, attributeMap, property);
        results.attributes.push(result.attribute);
      } else {
        console.error(`Add a akeneo mapping for ${attributeMap[property].akeneo_type}` + ` for ${property}`);
        logger.error({ moduleName, methodName },
          `Add a akeneo mapping for ${attributeMap[property].akeneo_type}` + ` for ${property}`);
        process.exit(99);
      }
    }
  }

  // Save the map so it can be used later from products/transform.ts
  fs.writeFileSync(`${exportPath}${path.sep}transformedAttributes.json`, JSON.stringify(results, null, '  '));

  return results;
}
