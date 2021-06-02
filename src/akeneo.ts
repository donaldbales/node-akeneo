// src/akeneo.ts

import Logger from 'bunyan';
import * as change from 'change-case';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import { get, patch, patchVndAkeneoCollection, postMultipartFormData } from './http';
import { AssetFamily } from './interfaces/AssetFamily';
import { AssetFamilyAttribute } from './interfaces/AssetFamilyAttribute';
import { AssetFamilyAttributeOption } from './interfaces/AssetFamilyAttributeOption';
import { AssetFamilyAsset } from './interfaces/AssetFamilyAsset';

import { Asset } from './interfaces/Asset';
import { AssetCategory } from './interfaces/AssetCategory';
import { AssetReferenceFile } from './interfaces/AssetReferenceFile';
import { AssetTag } from './interfaces/AssetTag';
import { AssetVariationFile } from './interfaces/AssetVariationFile';

import { AssociationType } from './interfaces/AssociationType';
import { Attribute } from './interfaces/Attribute';
import { AttributeGroup } from './interfaces/AttributeGroup';
import { AttributeOption } from './interfaces/AttributeOption';
import { Category } from './interfaces/Category';
import { Channel } from './interfaces/Channel';
import { Currency } from './interfaces/Currency';
import { Family } from './interfaces/Family';
import { FamilyVariant } from './interfaces/FamilyVariant';
import { Locale } from './interfaces/Locale';
import { MeasureFamily } from './interfaces/MeasureFamily';
import { Product } from './interfaces/Product';
import { ProductModel } from './interfaces/ProductModel';
import { ReferenceEntity } from './interfaces/ReferenceEntity';
import { ReferenceEntityAttribute } from './interfaces/ReferenceEntityAttribute';
import { ReferenceEntityAttributeOption } from './interfaces/ReferenceEntityAttributeOption';
import { ReferenceEntityRecord } from './interfaces/ReferenceEntityRecord';

import { getLogger } from './logger';

const moduleName: string = 'akeneo';

const logger: any = getLogger(moduleName);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';

const OK: any = { status: 'OK' };

export const patchLimit: number = Number.parseInt((process.env.AKENEO_PATCH_LIMIT as string) || '100', 10);

export const AKENEO_CATEGORIES: string = 'categories';

export const AKENEO_REFERENCE_ENTITY: string            = 'akeneo_reference_entity';
export const AKENEO_REFERENCE_ENTITY_COLLECTION: string = 'akeneo_reference_entity_collection';
export const PIM_CATALOG_ASSET_COLLECTION: string       = 'pim_catalog_asset_collection';      
export const PIM_CATALOG_BOOLEAN: string                = 'pim_catalog_boolean';
export const PIM_CATALOG_DATE: string                   = 'pim_catalog_date';
export const PIM_CATALOG_FILE: string                   = 'pim_catalog_file';
export const PIM_CATALOG_IDENTIFIER: string             = 'pim_catalog_identifier';
export const PIM_CATALOG_IMAGE: string                  = 'pim_catalog_image';
export const PIM_CATALOG_METRIC: string                 = 'pim_catalog_metric';
export const PIM_CATALOG_MULTISELECT: string            = 'pim_catalog_multiselect';
export const PIM_CATALOG_NUMBER: string                 = 'pim_catalog_number';
export const PIM_CATALOG_PRICE_COLLECTION: string       = 'pim_catalog_price_collection';
export const PIM_CATALOG_SIMPLESELECT: string           = 'pim_catalog_simpleselect';
export const PIM_CATALOG_TEXT: string                   = 'pim_catalog_text';
export const PIM_CATALOG_TEXTAREA: string               = 'pim_catalog_textarea';
export const PIM_REFERENCE_DATA_MULTISELECT: string     = 'pim_reference_data_multiselect';
export const PIM_REFERENCE_DATA_SIMPLESELECT: string    = 'pim_reference_data_simpleselect';

export const ATTRIBUTE_TYPES: Set<string> = new Set([
  AKENEO_REFERENCE_ENTITY,
  AKENEO_REFERENCE_ENTITY_COLLECTION,
  PIM_CATALOG_ASSET_COLLECTION,
  PIM_CATALOG_BOOLEAN,
  PIM_CATALOG_DATE,
  PIM_CATALOG_FILE,
//  PIM_CATALOG_IDENTIFIER, there can be only one identifier
  PIM_CATALOG_IMAGE,
  PIM_CATALOG_METRIC,
  PIM_CATALOG_MULTISELECT,
  PIM_CATALOG_NUMBER,
  PIM_CATALOG_PRICE_COLLECTION,
  PIM_CATALOG_SIMPLESELECT,
  PIM_CATALOG_TEXT,
  PIM_CATALOG_TEXTAREA,
  PIM_REFERENCE_DATA_MULTISELECT,
  PIM_REFERENCE_DATA_SIMPLESELECT
]);

export const REFERENCE_ENTITY_IMAGE: string = 'image';
export const REFERENCE_ENTITY_MULTIPLE_OPTIONS: string = 'multiple_options';
export const REFERENCE_ENTITY_NUMBER: string = 'number';
export const REFERENCE_ENTITY_MULTIPLE_LINKS: string = 'reference_entity_multiple_links';
export const REFERENCE_ENTITY_SINGLE_LINK: string = 'reference_entity_single_link';
export const REFERENCE_ENTITY_SINGLE_OPTION: string = 'single_option';
export const REFERENCE_ENTITY_TEXT: string = 'text';
// Yes, I know, there isn't a textarea type, it's text + textarea boolean, but I need to differentiate
export const REFERENCE_ENTITY_TEXTAREA: string = 'textarea';

export const ASSET_FAMILY_MEDIA_FILE: string = 'media_file';
export const ASSET_FAMILY_MEDIA_LINK: string = 'media_link';
export const ASSET_FAMILY_MULTIPLE_OPTIONS: string = 'multiple_options';
export const ASSET_FAMILY_NUMBER: string = 'number';
export const ASSET_FAMILY_SINGLE_OPTION: string = 'single_option';
export const ASSET_FAMILY_TEXT: string = 'text';
// Yes, I know, there isn't a textarea type, it's text + textarea boolean, but I need to differentiate
export const ASSET_FAMILY_TEXTAREA: string = 'textarea'

const filenameAssociationTypes: string = 'associationTypes.json';
const filenameAttributes: string = 'attributes.json';
const filenameAttributeGroups: string = 'attributeGroups.json';
const filenameAttributeOptions: string = 'attributeOptions.json';
const filenameCategories: string = 'categories.json';
const filenameChannels: string = 'channels.json';
const filenameCurrencies: string = 'currencies.json';
const filenameFamilies: string = 'families.json';
const filenameFamilyVariants: string = 'familyVariants.json';
const filenameLocales: string = 'locales.json';
const filenameMeasureFamilies: string = 'measureFamilies.json';
const filenameProducts: string = 'products.json';
const filenameProductModels: string = 'productModels.json';

const filenameReferenceEntities: string = 'referenceEntities.json';
const filenameReferenceEntityAttributes: string = 'referenceEntityAttributes.json';
const filenameReferenceEntityAttributeOptions: string = 'referenceEntityAttributeOptions.json';
const filenameReferenceEntityRecords: string = 'referenceEntityRecords.json';

const filenameAssetFamilies: string = 'assetFamilies.json';
const filenameAssetFamilyAttributes: string = 'assetFamilyAttributes.json';
const filenameAssetFamilyAttributeOptions: string = 'assetFamilyAttributeOptions.json';
const filenameAssetFamilyAssets: string = 'assetFamilyAssets.json';

// v3 
const filenameAssets: string = 'assets.json';
const filenameAssetCategories: string = 'assetCategories.json';
const filenameAssetReferenceFiles: string = 'assetReferenceFiles.json';
const filenameAssetTags: string = 'assetTags.json';
const filenameAssetVariationFiles: string = 'assetVariationFiles.json';
// end of v3

export const close: any = util.promisify(fs.close);
export const open: any = util.promisify(fs.open);
export const read: any = util.promisify(fs.readFile);
export const unlink: any = util.promisify(fs.unlink);
export const write: any = util.promisify(fs.write);

// Helper functions

export function assetCode(name: string) {
  const tokens: any[] = name.split('-');
  let code: string = '';
  if (name &&
      name.length === 36 &&
      tokens.length === 5 &&
      tokens[0].length === 8 &&
      tokens[1].length === 4 &&
      tokens[2].length === 4 &&
      tokens[3].length === 4 &&
      tokens[4].length === 12) {
    code = name.replace(/-/g, "_");
  } else {
    code = `${change.snakeCase(name.replace(/[^0-9a-zA-Z]+/g, '_'))}`;
  }
  if (code.length > 255) {
    code = code.replace(/_/g, '');
  }
  if (code.length > 255) {
    console.error(`WARNING: asset code truncated to 255 characters: ${code.toString()}.`);
    code = code.slice(0, 255);
  }
  
  return code;
}

export function attributeCode(name: string) {
  const tokens: any[] = name.split('-');
  let code: string = '';
  if (name &&
      name.length === 36 &&
      tokens.length === 5 &&
      tokens[0].length === 8 &&
      tokens[1].length === 4 &&
      tokens[2].length === 4 &&
      tokens[3].length === 4 &&
      tokens[4].length === 12) {
    code = name.replace(/-/g, "_");
  } else {
    code = `${change.snakeCase(name.replace(/[^0-9a-zA-Z]+/g, '_'))}`;
  }
  if (code.length > 100) {
    code = code.replace(/_/g, '');
  }
  if (code.length > 100) {
    console.error(`WARNING: attribute code truncated to 100 characters: ${code.toString()}.`);
    code = code.slice(0, 100);
  }
  
  return code;
}

export function attributeLabel(property: string): string {
  let label: string = (property[0] === '"' &&
    property[property.length - 1] === '"') ?
    property.slice(1, property.length - 1) :
    change.capitalCase(property);
  if (label.length > 255) {
    console.error(`WARNING: label truncated to 255 characters: ${label}.`);
    label = label.slice(0, 255);
  }
  
  return label;
}

export function fileCode(name: string) {
  const tokens: any[] = name.split('-');
  let code: string = '';
  if (name &&
      name.length === 36 &&
      tokens.length === 5 &&
      tokens[0].length === 8 &&
      tokens[1].length === 4 &&
      tokens[2].length === 4 &&
      tokens[3].length === 4 &&
      tokens[4].length === 12) {
    code = name.replace(/-/g, "_");
  } else {
    code = `${change.snakeCase(name.replace(/[^0-9a-zA-Z]+/g, '_'))}`;
  }
  if (code.length > 255) {
    code = code.replace(/_/g, '');
  }
  if (code.length > 255) {
    console.error(`WARNING: file code truncated to 250 characters: ${code.toString()}.`);
    code = code.slice(0, 255);
  }
  
  return code;
}

export function referenceEntityCode(name: string) {
  const tokens: any[] = name.split('-');
  let code: string = '';
  if (name &&
      name.length === 36 &&
      tokens.length === 5 &&
      tokens[0].length === 8 &&
      tokens[1].length === 4 &&
      tokens[2].length === 4 &&
      tokens[3].length === 4 &&
      tokens[4].length === 12) {
    code = name.replace(/-/g, "_");
  } else {
    code = `${change.snakeCase(name.replace(/[^0-9a-zA-Z]+/g, '_'))}`;
  }
  if (code.length > 255) {
    code = code.replace(/_/g, '');
  }
  if (code.length > 255) {
    console.error(`WARNING: reference entity code truncated to 255 characters: ${code.toString()}.`);
    code = code.slice(0, 255);
  }
  
  return code;
}

export function urlCode(name: string) {
  const tokens: any[] = name.split('-');
  let code: string = '';
  if (name &&
      name.length === 36 &&
      tokens.length === 5 &&
      tokens[0].length === 8 &&
      tokens[1].length === 4 &&
      tokens[2].length === 4 &&
      tokens[3].length === 4 &&
      tokens[4].length === 12) {
    code = name.replace(/-/g, "_");
  } else {
    code = `${encodeURIComponent(name).replace(/[^0-9a-zA-Z]/g, '_')}`;
  }
  if (code.length > 255) {
    code = code.replace(/_/g, '');
  }
  if (code.length > 255) {
    console.error(`WARNING: url code truncated to 255 characters: ${code.toString()}.`);
    code = code.slice(0, 255);
  }
  
  return code;
}

export function deQuote(property: string): string {
  let localProperty: string = property;
  if (localProperty &&
      localProperty[0] === '"' &&
      localProperty[localProperty.length - 1] === '"') {
    localProperty = localProperty.slice(1, localProperty.length - 1);    
  }
  
  return localProperty;
}

export function mkdirs(logger: Logger, dirParts: string[]) {
  const methodName: string = 'mkdirs';
  logger.debug({ moduleName, methodName }, `Starting...`);
  
  const dirs: any[] = exportPath.split(path.sep);
  for (const dirPart of dirParts) {
    dirs.push(dirPart);
  }
  let dirPath: string = '';
  for (const dir of dirs) {
    if (dir !== '.') {
      dirPath += path.sep;
      dirPath += dir;
      try  {
        fs.mkdirSync(dirPath);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
    } else {
      dirPath += dir;    
    }
  }
  return dirPath;
}

// Catalog APIs

export function apiUrlFamilies(): string {
  return '/api/rest/v1/families';
}

export function apiUrlFamilyVariants(familyCode: string): string {
  return `${apiUrlFamilies()}/${familyCode}/variants`;
}

export function apiUrlAttributes(): string {
  return '/api/rest/v1/attributes';
}

export function apiUrlAttributeOptions(attributeCode: string): string {
  return `${apiUrlAttributes()}/${attributeCode}/options`;
}

export function apiUrlAttributeGroups(): string {
  return '/api/rest/v1/attribute-groups';
}

export function apiUrlAssociationTypes(): string {
  return '/api/rest/v1/association-types';
}

export function apiUrlCategories(): string {
  return '/api/rest/v1/categories';
}

// Product APIs

export function apiUrlProducts(): string {
  return '/api/rest/v1/products';
}

export function apiUrlProductModels(): string {
  return '/api/rest/v1/product-models';
}

export function apiUrlPublishedProducts(): string {
  return '/api/rest/v1/published-products';
}

export function apiUrlProductMediaFiles(): string {
  return '/api/rest/v1/media-files';
}

// Target Market

export function apiUrlChannels(): string {
  return '/api/rest/v1/channels';
}

export function apiUrlLocales(): string {
  return '/api/rest/v1/locales';
}

export function apiUrlCurrencies(): string {
  return '/api/rest/v1/currencies';
}

export function apiUrlMeasureFamilies(): string {
  return '/api/rest/v1/measure-families';
}

/******************** R E F E R E N C E   E N T I T I E S ********************/

export function apiUrlReferenceEntities(referenceEntityCode: string = ''): string {
  if (referenceEntityCode) {
    return `/api/rest/v1/reference-entities/${referenceEntityCode}`;
  } else {
    return '/api/rest/v1/reference-entities';
  }
}

export function apiUrlReferenceEntityAttributes(
  referenceEntityCode: string,
  referenceEntityAttributeCode: string = ''): string {
  if (referenceEntityAttributeCode) {
    return `/api/rest/v1/reference-entities/${referenceEntityCode}/attributes/${referenceEntityAttributeCode}`;
  } else {
    return `/api/rest/v1/reference-entities/${referenceEntityCode}/attributes`;
  }
}

export function apiUrlReferenceEntityAttributeOptions(
  referenceEntityCode: string,
  referenceEntityAttributeCode: string,
  referenceEntityAttributeOptionCode: string = '') {
  if (referenceEntityAttributeOptionCode) {
    return `/api/rest/v1/reference-entities/${referenceEntityCode}` +
           `/attributes/${referenceEntityAttributeCode}` +
           `/options/${referenceEntityAttributeOptionCode}`;
  } else {
    return `/api/rest/v1/reference-entities/${referenceEntityCode}` +
           `/attributes/${referenceEntityAttributeCode}/options`;
  }
}

export function apiUrlReferenceEntityRecords(referenceEntityCode: string): string {
  return `/api/rest/v1/reference-entities/${referenceEntityCode}/records`;
}

export function apiUrlReferenceEntityMediaFiles(): string {
  return '/api/rest/v1/reference-entities-media-files';
}

/******************** A S S E T   F A M I L I E S ********************/

export function apiUrlAssetFamilies(assetFamilyCode: string = ''): string {
  if (assetFamilyCode) {
    return `/api/rest/v1/asset-families/${assetFamilyCode}`;
  } else {
    return '/api/rest/v1/asset-families';
  }
}

export function apiUrlAssetFamilyAttributes(
  assetFamilyCode: string,
  assetFamilyAttributeCode: string = ''): string {
  if (assetFamilyAttributeCode) {
    return `/api/rest/v1/asset-families/${assetFamilyCode}/attributes/${assetFamilyAttributeCode}`;
  } else {
    return `/api/rest/v1/asset-families/${assetFamilyCode}/attributes`;
  }
}

export function apiUrlAssetFamilyAttributeOptions(
  assetFamilyCode: string,
  assetFamilyAttributeCode: string,
  assetFamilyAttributeOptionCode: string = ''): string {
  if (assetFamilyAttributeOptionCode) {
    return `/api/rest/v1/asset-families/${assetFamilyCode}` +
           `/attributes/${assetFamilyAttributeCode}` +
           `/options/${assetFamilyAttributeOptionCode}`;
  } else {
    return `/api/rest/v1/asset-families/${assetFamilyCode}` +
           `/attributes/${assetFamilyAttributeCode}` +
           `/options`;
  }
}

export function apiUrlAssetFamilyMediaFiles(assetFamilyAssetCode: string = ''): string {
  if (assetFamilyAssetCode) {
    return `/api/rest/v1/asset-media-files/${assetFamilyAssetCode}`;
  } else {
    return `/api/rest/v1/asset-media-files`;
  }
}

export function apiUrlAssetFamilyAssets(
  assetFamilyCode: string,
  assetFamilyAssetCode: string = ''): string {
  if (assetFamilyAssetCode) {
    return `/api/rest/v1/asset-families/${assetFamilyCode}/assets/${assetFamilyAssetCode}`;
  } else {
    return `/api/rest/v1/asset-families/${assetFamilyCode}/assets`;
  }
}

// v3
// PAM

export function apiUrlAssets(): string {
  return `/api/rest/v1/assets`;
}

export function apiUrlAssetReferenceFiles(assetCode: string, localeCode: string): string {
  return `/api/rest/v1/assets/${assetCode}/reference-files/${localeCode}`;
}

export function apiUrlAssetVariationFiles(assetCode: string, channelCode: string, localeCode: string): string {
  return `/api/rest/v1/assets/${assetCode}/variation-files/${channelCode}/${localeCode}`;
}

export function apiUrlAssetCategories(): string {
  return '/api/rest/v1/asset-categories';
}

export function apiUrlAssetTags(): string {
  return '/api/rest/v1/asset-tags';
}

// end of v3

export async function exportAssociationTypes(): Promise<any> {
  const methodName: string = 'exportAssociationTypes';
  logger.info({ moduleName, methodName }, 'Starting...');

  let associationTypes: AssociationType[];
  try {
    associationTypes = await get(apiUrlAssociationTypes());
    logger.debug({ moduleName, methodName, associationTypes });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (associationTypes !== null &&
      typeof associationTypes[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAssociationTypes);
    const fileDesc: number = await open(fileName, 'w');
    for (const associationType of associationTypes) {
      await write(fileDesc, Buffer.from(JSON.stringify(associationType) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportAttributes(): Promise<any> {
  const methodName: string = 'exportAttributes';
  logger.info({ moduleName, methodName }, 'Starting...');

  try {
    await unlink(path.join(exportPath, filenameAttributeOptions));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error({ moduleName, methodName, err });
    }
  }

  const attributes: Attribute[] = await get(apiUrlAttributes());
  logger.debug({ moduleName, methodName, attributes });

  if (attributes !== null &&
      typeof attributes[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, 'attributes.json');
    const fileDesc: number = await open(fileName, 'w');
    for (const attribute of attributes) {
      await write(fileDesc, Buffer.from(JSON.stringify(attribute) + '\n'));
      if (attribute.type === 'pim_catalog_simpleselect' ||
          attribute.type === 'pim_catalog_multiselect') {
        try {
          await exportAttributeOptions(attribute.code);
        } catch (err) {
          logger.info({ moduleName, methodName, err });
          return err;
        }
      }
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportAttributeGroups(): Promise<any> {
  const methodName: string = 'exportAttributeGroups';
  logger.info({ moduleName, methodName }, 'Starting...');

  let attributeGroups: AttributeGroup[];
  try {
    attributeGroups = await get(apiUrlAttributeGroups());
    logger.debug({ moduleName, methodName, attributeGroups });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (attributeGroups !== null &&
      typeof attributeGroups[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAttributeGroups);
    const fileDesc: number = await open(fileName, 'w');
    for (const attributeGroup of attributeGroups) {
      await write(fileDesc, Buffer.from(JSON.stringify(attributeGroup) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportAttributeOptions(attributeCode: string): Promise<any> {
  const methodName: string = 'exportAttributeOptions';
  logger.info({ moduleName, methodName, attributeCode }, 'Starting...');

  let attributeOptions: AttributeOption[];
  try {
    attributeOptions = await get(apiUrlAttributeOptions(attributeCode));
    logger.debug({ moduleName, methodName, attributeOptions });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (attributeOptions !== null &&
      typeof attributeOptions[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAttributeOptions);
    const fileDesc: number = await open(fileName, 'a');
    for (const attributeOption of attributeOptions) {
      await write(fileDesc, Buffer.from(JSON.stringify(attributeOption) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportCategories(): Promise<any> {
  const methodName: string = 'exportCategories';
  logger.info({ moduleName, methodName }, 'Starting...');

  let categories: Category[];
  try {
    categories = await get(apiUrlCategories());
    logger.debug({ moduleName, methodName, categories });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (categories !== null &&
      typeof categories[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameCategories);
    const fileDesc: number = await open(fileName, 'w');
    for (const category of categories) {
      await write(fileDesc, Buffer.from(JSON.stringify(category) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportChannels(): Promise<any> {
  const methodName: string = 'exportChannels';
  logger.info({ moduleName, methodName }, 'Starting...');

  let channels: Channel[];
  try {
    channels = await get(apiUrlChannels());
    logger.debug({ moduleName, methodName, channels });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (channels !== null &&
      typeof channels[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameChannels);
    const fileDesc: number = await open(fileName, 'w');
    for (const channel of channels) {
      await write(fileDesc, Buffer.from(JSON.stringify(channel) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportCurrencies(): Promise<any> {
  const methodName: string = 'exportCurrencies';
  logger.info({ moduleName, methodName }, 'Starting...');

  let currencies: Currency[];
  try {
    currencies = await get(apiUrlCurrencies());
    logger.debug({ moduleName, methodName, currencies });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (currencies !== null &&
      typeof currencies[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameCurrencies);
    const fileDesc: number = await open(fileName, 'w');
    for (const currency of currencies) {
      await write(fileDesc, Buffer.from(JSON.stringify(currency) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportFamilies(): Promise<any> {
  const methodName: string = 'exportFamilies';
  logger.info({ moduleName, methodName }, 'Starting...');

  try {
    await unlink(path.join(exportPath, filenameFamilyVariants));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error({ moduleName, methodName, err });
    }
  }

  let families: Family[];
  try {
    families = await get(apiUrlFamilies());
    logger.debug({ moduleName, methodName, families });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (families !== null &&
      typeof families[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameFamilies);
    const fileDesc: number = await open(fileName, 'w');
    for (const family of families) {
      await write(fileDesc, Buffer.from(JSON.stringify(family) + '\n'));
      try {
        await exportFamilyVariants(family.code);
      } catch (err) {
        logger.info({ moduleName, methodName, err });
        return err;
      }
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportFamilyVariants(familyCode: string): Promise<any> {
  const methodName: string = 'exportFamilyVariants';
  logger.info({ moduleName, methodName, familyCode }, 'Starting...');

  let familyVariants: FamilyVariant[];
  try {
    familyVariants = await get(apiUrlFamilyVariants(familyCode));
    logger.debug({ moduleName, methodName, familyVariants });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (familyVariants !== null &&
      typeof familyVariants[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameFamilyVariants);
    const fileDesc: number = await open(fileName, 'a');
    for (const familyVariant of familyVariants) {
      // NOTE: I had to add attribute family. Even though the doc says it's
      //       not needed, it doesn't work without it.
      if (!(familyVariant.family)) {
        familyVariant.family = familyCode;
      }
      await write(fileDesc, Buffer.from(JSON.stringify(familyVariant) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportLocales(): Promise<any> {
  const methodName: string = 'exportLocales';
  logger.info({ moduleName, methodName }, 'Starting...');

  let locales: Locale[];
  try {
    locales = await get(apiUrlLocales());
    logger.debug({ moduleName, methodName, locales });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (locales !== null &&
      typeof locales[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameLocales);
    const fileDesc: number = await open(fileName, 'w');
    for (const locale of locales) {
      await write(fileDesc, Buffer.from(JSON.stringify(locale) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportMeasureFamilies(): Promise<any> {
  const methodName: string = 'exportMeasureFamilies';
  logger.info({ moduleName, methodName }, 'Starting...');

  let measureFamilies: MeasureFamily[];
  try {
    measureFamilies = await get(apiUrlMeasureFamilies());
    logger.debug({ moduleName, methodName, measureFamilies });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (measureFamilies !== null &&
      typeof measureFamilies[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameMeasureFamilies);
    const fileDesc: number = await open(fileName, 'w');
    for (const measureFamily of measureFamilies) {
      await write(fileDesc, Buffer.from(JSON.stringify(measureFamily) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportProducts(): Promise<any> {
  const methodName: string = 'exportProduct';
  logger.info({ moduleName, methodName }, 'Starting...');

  let products: Product[];
  const fileName: string = path.join(exportPath, filenameProducts);
  const fileDesc: number = await open(fileName, 'w');
  let count: number = 0;
  try {
    products = await get(`${apiUrlProducts()}?pagination_type=search_after`, async (results: any[]) => {
      console.log(results.length);
      console.log(json.length);
      const json = JSON.stringify(results);
      console.log(inspect(json, 4));
      process.exit(99);
      const buffer: Buffer = Buffer().alloc(.length);
      for (const result of results) {
        buffer.concat(JSON.stringify(buffer) + '\n');      
      } 
      await write(fileDesc, buffer);
      ++count;
    });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  logger.info({ moduleName, methodName, products: count });
  await close(fileDesc);

  return OK;
}

export async function exportProductModels(): Promise<any> {
  const methodName: string = 'exportProductModels';
  logger.info({ moduleName, methodName }, 'Starting...');

  let productModels: ProductModel[];
  try {
    productModels = await get(apiUrlProductModels());
    logger.debug({ moduleName, methodName, productModels });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (productModels !== null &&
      typeof productModels[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameProductModels);
    const fileDesc: number = await open(fileName, 'w');
    for (const productModel of productModels) {
      await write(fileDesc, Buffer.from(JSON.stringify(productModel) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

// TODO: export function exportPublishedProduct(): Promise<any>
// TODO: export function exportProductMediaFile(): Promise<any>

/******************** R E F E R E N C E   E N T I T I E S ********************/

export async function exportReferenceEntities(): Promise<any> {
  const methodName: string = 'exportReferenceEntities';
  logger.info({ moduleName, methodName }, 'Starting...');

  try {
    await unlink(path.join(exportPath, filenameReferenceEntityAttributes));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error({ moduleName, methodName, err });
    }
  }

  try {
    await unlink(path.join(exportPath, filenameReferenceEntityAttributeOptions));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error({ moduleName, methodName, err });
    }
  }

  try {
    await unlink(path.join(exportPath, filenameReferenceEntityRecords));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error({ moduleName, methodName, err });
    }
  }

  let referenceEntities: ReferenceEntity[];
  try {
    referenceEntities = await get(apiUrlReferenceEntities());
    logger.debug({ moduleName, methodName, referenceEntities });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (referenceEntities !== null &&
      typeof referenceEntities[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameReferenceEntities);
    const fileDesc: number = await open(fileName, 'w');
    for (const referenceEntity of referenceEntities) {
      await write(fileDesc, Buffer.from(JSON.stringify(referenceEntity) + '\n'));
      try {
        await exportReferenceEntityAttributes(referenceEntity.code);
      } catch (err) {
        logger.info({ moduleName, methodName, err });
        return err;
      }
      try {
        await exportReferenceEntityRecords(referenceEntity.code);
      } catch (err) {
        logger.info({ moduleName, methodName, err });
        return err;
      }
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportReferenceEntityAttributes(referenceEntityCode: string): Promise<any> {
  const methodName: string = 'exportReferenceEntityAttributes';
  logger.info({ moduleName, methodName }, 'Starting...');

  let referenceEntityAttributes: ReferenceEntityAttribute[];
  try {
    referenceEntityAttributes = await get(apiUrlReferenceEntityAttributes(referenceEntityCode));
    logger.debug({ moduleName, methodName, referenceEntityAttributes });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (referenceEntityAttributes !== null &&
      typeof referenceEntityAttributes[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameReferenceEntityAttributes);
    const fileDesc: number = await open(fileName, 'a');
    for (const referenceEntityAttribute of referenceEntityAttributes) {
      if (!(referenceEntityAttribute.delete_reference_entity_code)) {
        referenceEntityAttribute.delete_reference_entity_code = referenceEntityCode;
      }
      await write(fileDesc, Buffer.from(JSON.stringify(referenceEntityAttribute) + '\n'));
      if (referenceEntityAttribute.type === 'multiple_options' ||
          referenceEntityAttribute.type === 'single_option') {
        try {
          await exportReferenceEntityAttributeOptions(referenceEntityCode, referenceEntityAttribute.code);
        } catch (err) {
          logger.info({ moduleName, methodName, err });
          return err;
        }
      }
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportReferenceEntityAttributeOptions(referenceEntityCode: string,
                                                            attributeCode: string): Promise<any> {
  const methodName: string = 'exportReferenceEntityAttributeOptions';
  logger.info({ moduleName, methodName }, 'Starting...');

  let referenceEntityAttributeOptions: ReferenceEntityAttributeOption[] = [];
  try {
    referenceEntityAttributeOptions = await get(apiUrlReferenceEntityAttributeOptions(referenceEntityCode,
                                                                                      attributeCode));
    logger.debug({ moduleName, methodName, referenceEntityAttributeOptions });
  } catch (err) {
    if (err.code && err.code !== 404) {
      logger.info({ moduleName, methodName, err });
      return err;
    }
  }
  if (referenceEntityAttributeOptions !== null &&
      typeof referenceEntityAttributeOptions[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameReferenceEntityAttributeOptions);
    const fileDesc: number = await open(fileName, 'a');
    for (const referenceEntityAttributeOption of referenceEntityAttributeOptions) {
      if (!(referenceEntityAttributeOption.delete_reference_entity_code)) {
        referenceEntityAttributeOption.delete_reference_entity_code = referenceEntityCode;
      }
      if (!(referenceEntityAttributeOption.delete_attribute_code)) {
        referenceEntityAttributeOption.delete_attribute_code = attributeCode;
      }
      await write(fileDesc, Buffer.from(JSON.stringify(referenceEntityAttributeOption) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportReferenceEntityRecords(referenceEntityCode: string): Promise<any> {
  const methodName: string = 'exportReferenceEntityRecords';
  logger.info({ moduleName, methodName }, 'Starting...');

  let referenceEntityRecords: ReferenceEntityRecord[];
  try {
    referenceEntityRecords = await get(apiUrlReferenceEntityRecords(referenceEntityCode));
    logger.debug({ moduleName, methodName, referenceEntityRecords });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (referenceEntityRecords !== null &&
      typeof referenceEntityRecords[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameReferenceEntityRecords);
    const fileDesc: number = await open(fileName, 'a');
    for (const referenceEntityRecord of referenceEntityRecords) {
      if (!(referenceEntityRecord.delete_reference_entity_code)) {
        referenceEntityRecord.delete_reference_entity_code = referenceEntityCode;
      }
      await write(fileDesc, Buffer.from(JSON.stringify(referenceEntityRecord) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

// TODO: export function exportReferenceEntityMediaFile(): Promise<any>

/******************** A S S E T   F A M I L I E S ********************/

export async function exportAssetFamilies(): Promise<any> {
  const methodName: string = 'exportAssetFamilies';
  logger.info({ moduleName, methodName }, 'Starting...');

  try {
    await unlink(path.join(exportPath, filenameAssetFamilyAttributes));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error({ moduleName, methodName, err });
    }
  }

  try {
    await unlink(path.join(exportPath, filenameAssetFamilyAttributeOptions));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error({ moduleName, methodName, err });
    }
  }

  try {
    await unlink(path.join(exportPath, filenameAssetFamilyAssets));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logger.error({ moduleName, methodName, err });
    }
  }

  let assetFamilies: AssetFamily[];
  try {
    assetFamilies = await get(apiUrlAssetFamilies());
    logger.debug({ moduleName, methodName, assetFamilies });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (assetFamilies !== null &&
      typeof assetFamilies[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAssetFamilies);
    const fileDesc: number = await open(fileName, 'w');
    for (const assetFamily of assetFamilies) {
      await write(fileDesc, Buffer.from(JSON.stringify(assetFamily) + '\n'));
      try {
        await exportAssetFamilyAttributes(assetFamily.code);
      } catch (err) {
        logger.info({ moduleName, methodName, err });
        return err;
      }
      try {
        await exportAssetFamilyAssets(assetFamily.code);
      } catch (err) {
        logger.info({ moduleName, methodName, err });
        return err;
      }
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportAssetFamilyAttributes(assetFamilyCode: string): Promise<any> {
  const methodName: string = 'exportAssetFamilyAttributes';
  logger.info({ moduleName, methodName }, 'Starting...');

  let assetFamilyAttributes: AssetFamilyAttribute[];
  try {
    assetFamilyAttributes = await get(apiUrlAssetFamilyAttributes(assetFamilyCode));
    logger.debug({ moduleName, methodName, assetFamilyAttributes });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (assetFamilyAttributes !== null &&
      typeof assetFamilyAttributes[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAssetFamilyAttributes);
    const fileDesc: number = await open(fileName, 'a');
    for (const assetFamilyAttribute of assetFamilyAttributes) {
      if (!(assetFamilyAttribute.delete_asset_family_code)) {
        assetFamilyAttribute.delete_asset_family_code = assetFamilyCode;
      }
      await write(fileDesc, Buffer.from(JSON.stringify(assetFamilyAttribute) + '\n'));
      if (assetFamilyAttribute.type === 'multiple_options' ||
          assetFamilyAttribute.type === 'single_option') {
        try {
          await exportAssetFamilyAttributeOptions(assetFamilyCode, assetFamilyAttribute.code);
        } catch (err) {
          logger.info({ moduleName, methodName, err });
          return err;
        }
      }
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportAssetFamilyAttributeOptions(assetFamilyCode: string,
                                                            attributeCode: string): Promise<any> {
  const methodName: string = 'exportAssetFamilyAttributeOptions';
  logger.info({ moduleName, methodName }, 'Starting...');

  let assetFamilyAttributeOptions: AssetFamilyAttributeOption[] = [];
  try {
    assetFamilyAttributeOptions = await get(apiUrlAssetFamilyAttributeOptions(assetFamilyCode,
                                                                                      attributeCode));
    logger.debug({ moduleName, methodName, assetFamilyAttributeOptions });
  } catch (err) {
    if (err.code && err.code !== 404) {
      logger.info({ moduleName, methodName, err });
      return err;
    }
  }
  if (assetFamilyAttributeOptions !== null &&
      typeof assetFamilyAttributeOptions[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAssetFamilyAttributeOptions);
    const fileDesc: number = await open(fileName, 'a');
    for (const assetFamilyAttributeOption of assetFamilyAttributeOptions) {
      if (!(assetFamilyAttributeOption.delete_asset_family_code)) {
        assetFamilyAttributeOption.delete_asset_family_code = assetFamilyCode;
      }
      if (!(assetFamilyAttributeOption.delete_attribute_code)) {
        assetFamilyAttributeOption.delete_attribute_code = attributeCode;
      }
      await write(fileDesc, Buffer.from(JSON.stringify(assetFamilyAttributeOption) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportAssetFamilyAssets(assetFamilyCode: string): Promise<any> {
  const methodName: string = 'exportAssetFamilyAssets';
  logger.info({ moduleName, methodName }, 'Starting...');

  let assetFamilyAssets: AssetFamilyAsset[];
  try {
    assetFamilyAssets = await get(apiUrlAssetFamilyAssets(assetFamilyCode));
    logger.debug({ moduleName, methodName, assetFamilyAssets });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (assetFamilyAssets !== null &&
      typeof assetFamilyAssets[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAssetFamilyAssets);
    const fileDesc: number = await open(fileName, 'a');
    for (const assetFamilyAsset of assetFamilyAssets) {
      if (!(assetFamilyAsset.delete_asset_family_code)) {
        assetFamilyAsset.delete_asset_family_code = assetFamilyCode;
      }
      await write(fileDesc, Buffer.from(JSON.stringify(assetFamilyAsset) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

// TODO: export function exportAssetFamilyMediaFiles(): Promise<any>

// TODO: PAM exports
export async function exportAssets(): Promise<any> {
  const methodName: string = 'exportAssets';
  logger.info({ moduleName, methodName }, 'Starting...');

  let assets: Asset[];
  try {
    assets = await get(apiUrlAssets());
    logger.debug({ moduleName, methodName, assets });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (assets !== null &&
      typeof assets[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAssets);
    const fileDesc: number = await open(fileName, 'w');
    for (const asset of assets) {
      await write(fileDesc, Buffer.from(JSON.stringify(asset) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

export async function exportAssetCategories(): Promise<any> {
  const methodName: string = 'exportAssetCategories';
  logger.info({ moduleName, methodName }, 'Starting...');

  let assetCategories: AssetCategory[];
  try {
    assetCategories = await get(apiUrlAssetCategories());
    logger.debug({ moduleName, methodName, assetCategories });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (assetCategories !== null &&
      typeof assetCategories[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAssetCategories);
    const fileDesc: number = await open(fileName, 'w');
    for (const assetCategory of assetCategories) {
      await write(fileDesc, Buffer.from(JSON.stringify(assetCategory) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

// export async function exportAssetReferenceFiles(): Promise<any> {

export async function exportAssetTags(): Promise<any> {
  const methodName: string = 'exportAssetTags';
  logger.info({ moduleName, methodName }, 'Starting...');

  let assetTags: AssetTag[];
  try {
    assetTags = await get(apiUrlAssetTags());
    logger.debug({ moduleName, methodName, assetTags });
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }
  if (assetTags !== null &&
      typeof assetTags[Symbol.iterator] === 'function') {
    const fileName: string = path.join(exportPath, filenameAssetTags);
    const fileDesc: number = await open(fileName, 'w');
    for (const assetTag of assetTags) {
      await write(fileDesc, Buffer.from(JSON.stringify(assetTag) + '\n'));
    }
    await close(fileDesc);
  }
  return OK;
}

// export async function exportAssetVariationFiles(): Promise<any> {

/******************************************************************************
                     I M P O R T   F U N C T I O N S
******************************************************************************/

export async function importAssociationTypes(): Promise<any> {
  const methodName: string = 'importAssociationTypes';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameAssociationTypes);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const associationTypes: AssociationType[] = JSON.parse(`[ ${buffer} ]`);
    const results = await patchVndAkeneoCollection(apiUrlAssociationTypes(), associationTypes);
    logger.info({ moduleName, methodName, results });
  }
  return OK;
}

export async function importAttributes(): Promise<any> {
  const methodName: string = 'importAttributes';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameAttributes);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const attributes: Attribute[] = JSON.parse(`[ ${buffer} ]`);
    const results = await patchVndAkeneoCollection(apiUrlAttributes(), attributes);
    logger.info({ moduleName, methodName, results });
  }
  return OK;
}

export async function importAttributeGroups(): Promise<any> {
  const methodName: string = 'importAttributeGroups';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameAttributeGroups);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const attributeGroups: Attribute[] = JSON.parse(`[ ${buffer} ]`);
    const results = await patchVndAkeneoCollection(apiUrlAttributeGroups(), attributeGroups);
    logger.info({ moduleName, methodName, results });
  }
  return OK;
}

export async function importAttributeOptions(): Promise<any> {
  const methodName: string = 'importAttributeOptions';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameAttributeOptions);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const attributeOptions: AttributeOption[] = JSON.parse(`[ ${buffer} ]`);
    if (attributeOptions.length > 0 &&
        attributeOptions[0].attribute) {
      let attributeCode: string = attributeOptions[0].attribute || '';
      let attributeCodeAttributeOptions: any[] = [];
      for (let i = 0; i < attributeOptions.length; i++) {
        if (attributeCode !== attributeOptions[i].attribute ||
           (i + 1) === attributeOptions.length) {
          const results = await patchVndAkeneoCollection(
            apiUrlAttributeOptions(attributeCode), attributeCodeAttributeOptions);
          logger.info({ moduleName, methodName, results });
          attributeCode = attributeOptions[i].attribute || '';
          attributeCodeAttributeOptions = [];
        }
        const attributeOption: any = attributeOptions[i];
        attributeCodeAttributeOptions.push(attributeOption);
      }
    }
  }
  return OK;
}

export async function importCategories(): Promise<any> {
  const methodName: string = 'importCategories';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameCategories);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const categories: Category[] = JSON.parse(`[ ${buffer} ]`);
    const results = await patchVndAkeneoCollection(apiUrlCategories(), categories);
    logger.info({ moduleName, methodName, results });
  }
  return OK;
}

export async function importChannels(): Promise<any> {
  const methodName: string = 'importChannels';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameChannels);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const channels: Channel[] = JSON.parse(`[ ${buffer} ]`);
    const results = await patchVndAkeneoCollection(apiUrlChannels(), channels);
    logger.info({ moduleName, methodName, results });
  }
  return OK;
}

export async function importCurrencies(): Promise<any> {
  const methodName: string = 'importCurrencies';
  logger.info({ moduleName, methodName }, 'Starting...');
  logger.error({ moduleName, methodName }, 
    'Akeneo PIM does not support the import of currencies. ' +
    'Currencies are installed by: bin/console pim:installer:db.');
  return OK;
}

export async function importFamilies(): Promise<any> {
  const methodName: string = 'importFamilies';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameFamilies);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const families: Family[] = JSON.parse(`[ ${buffer} ]`);
    const results = await patchVndAkeneoCollection(apiUrlFamilies(), families);
    logger.info({ moduleName, methodName, results });
  }
  return OK;
}

export async function importFamilyVariants(): Promise<any> {
  const methodName: string = 'importFamilyVariants';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameFamilyVariants);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const familyVariants: FamilyVariant[] = JSON.parse(`[ ${buffer} ]`);
    if (familyVariants.length > 0 &&
        familyVariants[0].family) {
      let familyCode: string = familyVariants[0].family || '';
      let familyCodeFamilyVariants: any[] = [];
      for (let i = 0; i < familyVariants.length; i++) {
        if (familyCode !== familyVariants[i].family ||
           (i + 1) === familyVariants.length) {
          const results = await patchVndAkeneoCollection(apiUrlFamilyVariants(familyCode), familyCodeFamilyVariants);
          logger.info({ moduleName, methodName, results });
          familyCode = familyVariants[i].family || '';
          familyCodeFamilyVariants = [];
        }
        const familyVariant: any = familyVariants[i];
        delete familyVariant.family;
        familyCodeFamilyVariants.push(familyVariant);
      }
    }
  }
  return OK;
}

export async function importLocales(): Promise<any> {
  const methodName: string = 'importCurrencies';
  logger.info({ moduleName, methodName }, 'Starting...');
  logger.error({ moduleName, methodName }, 
    'Akeneo PIM does not support the import of locales. ' +
    'Locales are installed by: bin/console pim:installer:db.');
  return OK;
}

export async function importMeasureFamilies(): Promise<any> {
  const methodName: string = 'importCurrencies';
  logger.info({ moduleName, methodName }, 'Starting...');
  logger.error({ moduleName, methodName }, 
    'Akeneo PIM does not support the import of measure families. ' +
    'Measure Families are installed by: bin/console pim:installer:db.');
  return OK;
}

export async function importProducts(): Promise<any> {
  const methodName: string = 'importProducts';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameProducts);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const products: Product[] = JSON.parse(`[ ${buffer} ]`);
    const results = await patchVndAkeneoCollection(apiUrlProducts(), products);
    logger.info({ moduleName, methodName, results });
  }
  return OK;
}

export async function importProductModels(): Promise<any> {
  const methodName: string = 'importProductModels';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameProductModels);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const productModels: ProductModel[] = JSON.parse(`[ ${buffer} ]`);
    const results = await patchVndAkeneoCollection(apiUrlProductModels(), productModels);
    logger.info({ moduleName, methodName, results });
  }
  return OK;
}

/******************** R E F E R E N C E   E N T I T I E S ********************/

export async function importReferenceEntities(): Promise<any> {
  const methodName: string = 'importReferenceEntities';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameReferenceEntities);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const referenceEntities: ReferenceEntity[] = JSON.parse(`[ ${buffer} ]`);
    for (const referenceEntity of referenceEntities) {
      const results = await patch(`${apiUrlReferenceEntities()}/${referenceEntity.code}`, referenceEntity);
      // logger.info({ moduleName, methodName, results });
    }
  }
  return OK;
}

export async function importReferenceEntityAttributes(): Promise<any> {
  const methodName: string = 'importReferenceEntityAttributes';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameReferenceEntityAttributes);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const referenceEntityAttributes: ReferenceEntityAttribute[] = JSON.parse(`[ ${buffer} ]`);
    for (const referenceEntityAttribute of referenceEntityAttributes) {
      const referenceEntityCode: string = referenceEntityAttribute.delete_reference_entity_code || '';
      delete referenceEntityAttribute.delete_reference_entity_code;
      const results = await patch(
        `${apiUrlReferenceEntityAttributes(referenceEntityCode)}/${referenceEntityAttribute.code}`,
        referenceEntityAttribute);
      // logger.info({ moduleName, methodName, results });
    }
  }
  return OK;
}

export async function importReferenceEntityAttributeOptions(): Promise<any> {
  const methodName: string = 'importReferenceEntityAttributeOptions';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameReferenceEntityAttributeOptions);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const referenceEntityAttributeOptions: ReferenceEntityAttributeOption[] = JSON.parse(`[ ${buffer} ]`);
    for (const referenceEntityAttributeOption of referenceEntityAttributeOptions) {
      const referenceEntityCode: string = referenceEntityAttributeOption.delete_reference_entity_code || '';
      const attributeCode: string = referenceEntityAttributeOption.delete_attribute_code || '';
      delete referenceEntityAttributeOption.delete_reference_entity_code;
      delete referenceEntityAttributeOption.delete_attribute_code;
      const results = await patch(
        `${apiUrlReferenceEntityAttributeOptions(referenceEntityCode, attributeCode)}` +
        `/${referenceEntityAttributeOption.code}`,
        referenceEntityAttributeOption);
      // logger.info({ moduleName, methodName, results });
    }
  }
  return OK;
}

export async function importReferenceEntityRecords(): Promise<any> {
  const methodName: string = 'importReferenceEntityRecords';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameReferenceEntityRecords);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const referenceEntityRecords: ReferenceEntityRecord[] = JSON.parse(`[ ${buffer} ]`);
    if (referenceEntityRecords.length > 0) {
      let referenceEntityData: ReferenceEntityRecord[] = [];
      let referenceEntityCode: string = referenceEntityRecords[0].delete_reference_entity_code || '';
      let count: number = 0;
      for (let i = 0; i < referenceEntityRecords.length; i++) {
        if (referenceEntityCode !== referenceEntityRecords[i].delete_reference_entity_code ||
            (count > 0 && count % patchLimit === 0) ||
            (i + 1) === referenceEntityRecords.length) {
          const results = await patch(`${apiUrlReferenceEntityRecords(referenceEntityCode)}`,
                                      referenceEntityData);
          // logger.info({ moduleName, methodName, results });
          referenceEntityCode = referenceEntityRecords[i].delete_reference_entity_code || '';
          referenceEntityData = [];
          count = 0;
        }
        delete referenceEntityRecords[i].delete_reference_entity_code;
        referenceEntityData.push(referenceEntityRecords[i]);
        count++;
      }
    }
  }
  return OK;
}

export async function importReferenceEntityMediaFiles(referenceEntityCode: string, data: any[]): Promise<any[]> {
  const methodName: string = 'importReferenceEntityMediaFiles';
  logger.info({ moduleName, methodName }, `Starting...`);

  const dirs: any[] = exportPath.split(path.sep);
  dirs.push(referenceEntityCode);
  let dirPath: string = '';
  for (const dir of dirs) {
    if (dir !== '.') {
      dirPath += path.sep;
      dirPath += dir;
      try {
        fs.mkdirSync(dirPath);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
    } else {
      dirPath += dir;    
    }
    // console.log(dirPath);
  }
  
  const results: any = {};
  let referenceEntityMediaFileCode: string = '';
  for (const datum of data) {
    const code: string = datum.code;
    try {
      const stream: any = fs.createReadStream(`${dirPath}${path.sep}${code}.png`);
      referenceEntityMediaFileCode = await postMultipartFormData(
        apiUrlReferenceEntityMediaFiles(),
        stream);
        
      const result: any = {
        referenceEntityCode,
        referenceEntityMediaFileCode
      };
      
      results[code] = result;
    } catch (err) {
      logger.error({ moduleName, methodName, err }, `loading ${code}.png`);
      process.exit(99);
    }
  }
  const handle: any = await open(`${dirPath}${path.sep}referenceEntityMediaFilesMap.txt`, 'a');
  for (const result of results) {
    await write(handle, `${JSON.stringify(result).toString()}\n`);
  }
  await close(handle);
  
  return results;
} 

/******************** A S S E T   F A M I L I E S ********************/

export async function importAssetFamilies(): Promise<any> {
  const methodName: string = 'importAssetFamilies';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameAssetFamilies);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const assetFamilies: AssetFamily[] = JSON.parse(`[ ${buffer} ]`);
    for (const assetFamily of assetFamilies) {
      const results = await patch(`${apiUrlAssetFamilies()}/${assetFamily.code}`, assetFamily);
      // logger.info({ moduleName, methodName, results });
    }
  }
  return OK;
}

export async function importAssetFamilyAttributes(): Promise<any> {
  const methodName: string = 'importAssetFamilyAttributes';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameAssetFamilyAttributes);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const assetFamilyAttributes: AssetFamilyAttribute[] = JSON.parse(`[ ${buffer} ]`);
    for (const assetFamilyAttribute of assetFamilyAttributes) {
      const assetFamilyCode: string = assetFamilyAttribute.delete_asset_family_code || '';
      delete assetFamilyAttribute.delete_asset_family_code;
      const results = await patch(
        `${apiUrlAssetFamilyAttributes(assetFamilyCode)}/${assetFamilyAttribute.code}`,
        assetFamilyAttribute);
      // logger.info({ moduleName, methodName, results });
    }
  }
  return OK;
}

export async function importAssetFamilyAttributeOptions(): Promise<any> {
  const methodName: string = 'importAssetFamilyAttributeOptions';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameAssetFamilyAttributeOptions);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const assetFamilyAttributeOptions: AssetFamilyAttributeOption[] = JSON.parse(`[ ${buffer} ]`);
    for (const assetFamilyAttributeOption of assetFamilyAttributeOptions) {
      const assetFamilyCode: string = assetFamilyAttributeOption.delete_asset_family_code || '';
      const attributeCode: string = assetFamilyAttributeOption.delete_attribute_code || '';
      delete assetFamilyAttributeOption.delete_asset_family_code;
      delete assetFamilyAttributeOption.delete_attribute_code;
      const results = await patch(
        `${apiUrlAssetFamilyAttributeOptions(assetFamilyCode, attributeCode)}` +
        `/${assetFamilyAttributeOption.code}`,
        assetFamilyAttributeOption);
      // logger.info({ moduleName, methodName, results });
    }
  }
  return OK;
}

export async function importAssetFamilyAssets(): Promise<any> {
  const methodName: string = 'importAssetFamilyAssets';
  logger.info({ moduleName, methodName }, 'Starting...');

  const fileName: string = path.join(exportPath, filenameAssetFamilyAssets);
  const fileDesc: number = await open(fileName, 'r');
  const buffer: string = (await read(fileDesc)).toString().replace(/\n/gi, ', ').slice(0, -2);
  await close(fileDesc);
  if (buffer.length > 0) {
    const assetFamilyAssets: AssetFamilyAsset[] = JSON.parse(`[ ${buffer} ]`);
    if (assetFamilyAssets.length > 0) {
      let assetFamilyData: AssetFamilyAsset[] = [];
      let assetFamilyCode: string = assetFamilyAssets[0].delete_asset_family_code || '';
      let count: number = 0;
      for (let i = 0; i < assetFamilyAssets.length; i++) {
        if (assetFamilyCode !== assetFamilyAssets[i].delete_asset_family_code ||
            (count > 0 && count % patchLimit === 0) ||
            (i + 1) === assetFamilyAssets.length) {
          const results = await patch(`${apiUrlAssetFamilyAssets(assetFamilyCode)}`,
                                      assetFamilyData);
          // logger.info({ moduleName, methodName, results });
          assetFamilyCode = assetFamilyAssets[i].delete_asset_family_code || '';
          assetFamilyData = [];
          count = 0;
        }
        delete assetFamilyAssets[i].delete_asset_family_code;
        assetFamilyData.push(assetFamilyAssets[i]);
        count++;
      }
    }
  }
  return OK;
}

export async function importAssetFamilyMediaFiles(assetFamilyCode: string, data: any[]): Promise<any[]> {
  const methodName: string = 'importAssetFamilyMediaFiles';
  logger.info({ moduleName, methodName }, `Starting...`);

  const dirs: any[] = exportPath.split(path.sep);
  dirs.push(assetFamilyCode);
  let dirPath: string = '';
  for (const dir of dirs) {
    if (dir !== '.') {
      dirPath += path.sep;
      dirPath += dir;
      try {
        fs.mkdirSync(dirPath);
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }
    } else {
      dirPath += dir;    
    }
    // console.log(dirPath);
  }
  
  const results: any = {};
  let assetFamiliesMediaFileCode: string = '';
  for (const datum of data) {
    const code: string = datum.code;
    try {
      const stream: any = fs.createReadStream(`${dirPath}${path.sep}${code}.png`);
      assetFamiliesMediaFileCode = await postMultipartFormData(
        apiUrlReferenceEntityMediaFiles(),
        stream);
        
      const result: any = {
        assetFamilyCode,
        assetFamiliesMediaFileCode
      };
      
      results[code] = result;
    } catch (err) {
      logger.error({ moduleName, methodName, err }, `loading ${code}.png`);
      process.exit(99);
    }
  }
  const handle: any = await open(`${dirPath}${path.sep}assetFamilyMediaFilesMap.txt`, 'a');
  for (const result of results) {
    await write(handle, `${JSON.stringify(result).toString()}\n`);
  }
  await close(handle);
  
  return results;
} 

// TODO: PAM imports
// export async function importAssets(): Promise<any> {
// export async function importAssetCategories(): Promise<any> {
// export async function importAssetReferenceFiles(): Promise<any> {
// export async function importAssetTags(): Promise<any> {
// export async function importAssetVariationFiles(): Promise<any> {

// A main method with no command line parameter management
async function main(): Promise<any> {
  const methodName: string = 'main';
  logger.info({ moduleName, methodName }, `Starting...`);
/*
  await exportChannels();

  await exportLocales();

  await exportCurrencies();

  await exportMeasureFamilies();

  await exportAttributes();

  await exportAttributeGroups();

  await exportAssociationTypes();

  await exportCategories();

  await exportFamilies();

  await exportProducts();

  await exportProductModels();

  await exportReferenceEntities();
*/  
  await exportAssetFamilies();
/*
  // await exportAssets();

  // await exportAssetCategories();

  // await exportAssetTags();

  await importAssociationTypes();

  await importChannels();

  await importAttributes();

  await importAttributeOptions();

  await importAttributeGroups();

  await importFamilies();

  await importFamilyVariants();

  await importCategories();

  await importProducts();

  await importProductModels();

  await importReferenceEntities();

  await importReferenceEntityAttributes();

  await importReferenceEntityAttributeOptions();

  await importReferenceEntityRecords();
*/
  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 10000);
  }

  logger.info({ moduleName, methodName }, `Ending.`);
}

// Start the program
if (require.main === module) {
  main();
}
