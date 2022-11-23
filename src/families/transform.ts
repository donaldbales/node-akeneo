import * as akeneo from 'node-akeneo-api';
import * as change from 'change-case';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { inspect } from '../inspect';
import { Family } from '../interfaces/Family';
// import { FamilyVariant } from '../interfaces/FamilyVariant';

export const defaultAttributeAsLabel: string = 'Model';
const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'families/transform';

export async function families(logger: Logger, familyMap: any) {
  const methodName: string = 'families';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any = {
    families: [],
  };

  for (const family in familyMap) {
    logger.info({ moduleName, methodName, family });
    if (familyMap.hasOwnProperty(family)) {
      const attributes: any[] = [];
      let modelFound: boolean = false;
      for (const attribute in familyMap[family]) {
        if (attribute === defaultAttributeAsLabel) {
          modelFound = true;
        }
        attributes.push(akeneo.attributeCode(attribute));
      }
      if (!(modelFound)) {
        logger.info({ moduleName, methodName, family }, `Attribute ${defaultAttributeAsLabel} is missing in this family`);
      } else {
        const familyJSON: Family = {
          attribute_as_label: akeneo.attributeCode(defaultAttributeAsLabel),
          attributes,
          code: akeneo.attributeCode(family),
          labels: {en_US: family}
        };

        results.families.push(familyJSON);
      }
    } else {
      logger.error({ moduleName, methodName }, `Add a mapping for ${familyMap[family]}`);
      process.exit(99);
    }
  }
  return results;
}
