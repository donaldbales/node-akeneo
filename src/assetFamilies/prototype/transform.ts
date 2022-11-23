import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { ASSET_FAMILY_CODE } from './helper';
import { getLogger } from '../../logger';
import { AssetFamily } from '../../interfaces/AssetFamily';
import { AssetFamilyAttribute } from '../../interfaces/AssetFamilyAttribute';
import { AssetFamilyAttributeOption } from '../../interfaces/AssetFamilyAttributeOption';
import { AssetFamilyAsset } from '../../interfaces/AssetFamilyAsset';

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = `assetFamilies/${ASSET_FAMILY_CODE}/transform`;

function createMediaFile(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: AssetFamilyAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.ASSET_FAMILY_MEDIA_FILE,
    labels: {
      en_US: property
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    allowed_extensions: [],
    media_type: 'image'
  };
  results.attribute = attribute;

  return results;
}

function createMediaLink(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: AssetFamilyAttribute = {
    code: akeneo.attributeCode(property),
    labels: {
      en_US: property
    },
    type: akeneo.ASSET_FAMILY_MEDIA_LINK,
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    media_type: attributeMap[property].media_type ? attributeMap[property].media_type : 'other'
  };
  results.attribute = attribute;

  return results;
}

function createNumber(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: AssetFamilyAttribute = {
    code: akeneo.attributeCode(property),
    labels: {
      en_US: property
    },
    type: akeneo.ASSET_FAMILY_NUMBER,
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    decimals_allowed: false,
    min_value: '0',
    max_value: '999999999999'
  };
  results.attribute = attribute;

  return results;
}

function createSingleOption(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: AssetFamilyAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.ASSET_FAMILY_SINGLE_OPTION,
    labels: {
      en_US: property
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false
  };
  results.attribute = attribute;
  
  for (const option of attributeMap[property].options) {
    const attributeOption: AssetFamilyAttributeOption = {
      code: akeneo.attributeCode(option),
      labels: {
        en_US: option
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
  const attribute: AssetFamilyAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.ASSET_FAMILY_TEXT,
    labels: {
      en_US: property
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    is_textarea: false,
    is_rich_text_editor: false,
    max_characters: 255
  };
  results.attribute = attribute;

  return results;
}

function createTextArea(logger: any, attributeMap: any, property: string) {
  const results: any = {
    attribute: '',
    attributeOptions: []
  };
  const attribute: AssetFamilyAttribute = {
    code: akeneo.attributeCode(property),
    type: akeneo.ASSET_FAMILY_TEXT,
    labels: {
      en_US: property
    },
    value_per_locale: false,
    value_per_channel: false,
    is_required_for_completeness: false,
    is_textarea: true,
    is_rich_text_editor: false,
    max_characters: 65535
  };
  results.attribute = attribute;

  return results;
}

export function assetFamilyAttributes(logger: any, attributeMap: any): any {
  const methodName: string = 'assetFamilyAttributes';
  logger.info({ moduleName, methodName }, `Starting...`);

  const resultMap: any = {
    attributes: [],
    attributeOptions: []
  };
  
  for (const property in attributeMap) {
    if (attributeMap.hasOwnProperty(property)) {
      if (attributeMap[property].akeneo_type === akeneo.ASSET_FAMILY_MEDIA_FILE) {
        const result: any = createMediaFile(logger, attributeMap, property);
        resultMap.attributes.push({
          assetFamilyCode: ASSET_FAMILY_CODE,
          assetFamilyAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.ASSET_FAMILY_MEDIA_LINK) {
        const result: any = createMediaLink(logger, attributeMap, property);
        resultMap.attributes.push({
          assetFamilyCode: ASSET_FAMILY_CODE,
          assetFamilyAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.ASSET_FAMILY_NUMBER) {
        const result: any = createNumber(logger, attributeMap, property);
        resultMap.attributes.push({
          assetFamilyCode: ASSET_FAMILY_CODE,
          assetFamilyAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.ASSET_FAMILY_SINGLE_OPTION) {
        const result: any = createSingleOption(logger, attributeMap, property);
        resultMap.attributes.push({
          assetFamilyCode: ASSET_FAMILY_CODE,
          assetFamilyAttributeCode: result.attribute.code,
          attribute: result.attribute});

        for (const option of result.attributeOptions) {
          const assetFamilyCode: string = ASSET_FAMILY_CODE;
          const assetFamilyAttributeCode: string = result.attribute.code;
          const assetFamilyAttributeOptionCode: string = option.code;
          resultMap.attributeOptions.push({
            assetFamilyCode,
            assetFamilyAttributeCode,
            assetFamilyAttributeOptionCode,
            option});
        }
      } else
      if (attributeMap[property].akeneo_type === akeneo.ASSET_FAMILY_TEXT) {
        const result: any = createText(logger, attributeMap, property);
        resultMap.attributes.push({
          assetFamilyCode: ASSET_FAMILY_CODE,
          assetFamilyAttributeCode: result.attribute.code,
          attribute: result.attribute});
      } else
      if (attributeMap[property].akeneo_type === akeneo.ASSET_FAMILY_TEXTAREA) {
        const result: any = createTextArea(logger, attributeMap, property);
        resultMap.attributes.push({
          assetFamilyCode: ASSET_FAMILY_CODE,
          assetFamilyAttributeCode: result.attribute.code,
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

export function assetFamilyAssets(logger: any, extractedAssets: any[]): any[] {
  const methodName: string = 'assetFamilyAssets';
  logger.info({ moduleName, methodName, rows: extractedAssets.length }, `Starting...`);

  const results: any = [];
  
  for (const extractedAsset of extractedAssets) {
    let asset: any = {
      code: extractedAsset.code,
      values: {
        label: [
          { 
            locale: 'en_CA',
            channel: null,
            data: extractedAsset.label
          },
          { 
            locale: 'en_GB',
            channel: null,
            data: extractedAsset.label
          },
          { 
            locale: 'en_US',
            channel: null,
            data: extractedAsset.label
          }
        ]
      }
    };
    if (extractedAsset.media) {
      asset.values.media = [ {
        locale: null,
        channel: null,
        data: extractedAsset.media
      } ]; 
    }
    if (extractedAsset.Models) {
      asset.values.models = [ {
        locale: null,
        channel: null,
        data: extractedAsset.Models
      } ]; 
    }
    if (extractedAsset.Name) {
      asset.values.name = [ {
        locale: null,
        channel: null,
        data: extractedAsset.Name
      } ]; 
    }
    if (extractedAsset.Vendors) {
      asset.values.vendors = [ {
        locale: null,
        channel: null,
        data: extractedAsset.Vendors
      } ]; 
    }
    /* these will be transformations
    if (extractedAsset.Media500x500) {
      asset.values.media500x500 = [ {
        locale: null,
        channel: null,
        data: extractedAsset.Media500x500
      } ]; 
    }
    if (extractedAsset.Media80x80) {
      asset.values.media80x80 = [ {
        locale: null,
        channel: null,
        data: extractedAsset.Media80x80
      } ]; 
    }
    */
    results.push({
      assetFamilyCode: extractedAsset.assetFamilyCode,
      assetFamilyAssetCode: extractedAsset.code,
      asset
    });
  }
    
  return results;
}

