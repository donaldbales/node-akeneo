import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

import { get, patch } from './http';
import { AssociationType } from './interfaces/AssociationType';
import { Attribute } from './interfaces/Attribute';
import { AttributeGroup } from './interfaces/AttributeGroup';
import { AttributeOption } from './interfaces/AttributeOption';
import { Category } from './interfaces/Category';
import { Family } from './interfaces/Family';
import { FamilyVariant } from './interfaces/FamilyVariant';
import { getLogger } from './logger';

const logger: any = getLogger('nodeakeneo');

const moduleName: string = 'akeneo';
const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';

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

// Reference Entities

export function apiUrlReferenceEntities(): string {
  return '/api/rest/v1/reference-entities';
}

export function apiUrlReferenceEntityAttributes(referenceEntityCode: string): string {
  return `/api/rest/v1/reference-entities/${referenceEntityCode}/attributes`;
}

export function apiUrlReferenceEntityAttributeOptions(referenceEntityCode: string, attributeCode: string) {
  return `/api/rest/v1/reference-entities/${referenceEntityCode}/attributes/${attributeCode}/options`;
}

export function apiUrlReferenceEntityRecords(referenceEntityCode: string): string {
  return `/api/rest/v1/reference-entities/${referenceEntityCode}/records`;
}

export function apiUrlReferenceEntityMediaFiles(): string {
  return '/api/rest/v1/reference-entities-media-files';
}

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

const OK: any = { status: 'OK' };

const filenameAssociationTypes: string = 'associationTypes.json';
const filenameAttributes: string = 'attributes.json';
const filenameAttributeGroups: string = 'attributeGroups.json';
const filenameAttributeOptions: string = 'attributeOptions.json';
const filenameCategories: string = 'categories.json';
const filenameFamilies: string = 'families.json';
const filenameFamilyVariants: string = 'familyVariants.json';

const open: any = util.promisify(fs.open);
const write: any = util.promisify(fs.write);
const close: any = util.promisify(fs.close);
const unlink: any = util.promisify(fs.unlink);

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
    close(fileDesc);
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
    close(fileDesc);
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
    close(fileDesc);
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
    close(fileDesc);
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
    close(fileDesc);
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
    close(fileDesc);
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
      await write(fileDesc, Buffer.from(JSON.stringify(familyVariant) + '\n'));
    }
    close(fileDesc);
  }
  return OK;
}

// A main method with no command line parameter management
async function main(): Promise<any> {
  const methodName: string = 'main';
  logger.info({ moduleName, methodName }, `Starting...`);

  await exportAttributes();

  await exportAttributeGroups();

  await exportAssociationTypes();

  await exportCategories();

  await exportFamilies();

  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 10000);
  }

  logger.info({ moduleName, methodName }, `Ending.`);
}

// Start the program
if (require.main === module) {
  main();
}
