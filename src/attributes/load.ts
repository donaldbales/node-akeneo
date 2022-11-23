import * as akeneo from 'node-akeneo-api';
import Logger from 'bunyan';

import { Attribute} from '../interfaces/Attribute';
import { AttributeGroup } from '../interfaces/AttributeGroup';
import { AttributeOption } from '../interfaces/AttributeOption';

const moduleName: string = 'attributes/load';

export async function attributes(logger: Logger, data: any[]): Promise<any> {
  const methodName: string = 'attributes';
  logger.info({ moduleName, methodName }, 'Starting...');

  const attributez: any[] = data;
  const results = await akeneo.patchVndAkeneoCollection(akeneo.apiUrlAttributes(), attributez);
  logger.info({ moduleName, methodName, results });

  return ['OK'];
}

export async function attributeOptions(logger: Logger, data: any[]): Promise<any> {
  const methodName: string = 'importAttributeOptions';
  logger.info({ moduleName, methodName }, 'Starting...');

  const attributeOptionz: any[] = data;
  if (attributeOptionz.length > 0) {
    let attributeCode: string = '';
    let attributeCodeAttributeOptions: any[] = [];
    for (const attributeOption of attributeOptionz) {
      if (!(attributeCode)) {
        attributeCode = attributeOption.attribute;
      }
      if (attributeCode !== attributeOption.attribute) {
        const results = await akeneo.patchVndAkeneoCollection(
          akeneo.apiUrlAttributeOptions(attributeCode), attributeCodeAttributeOptions);
        logger.info({ moduleName, methodName, results });
        attributeCode = attributeOption.attribute;
        attributeCodeAttributeOptions = [];
      }
      attributeCodeAttributeOptions.push(attributeOption);
    }
    if (attributeCode &&
        attributeCodeAttributeOptions.length > 0) {
      const results = await akeneo.patchVndAkeneoCollection(
        akeneo.apiUrlAttributeOptions(attributeCode), attributeCodeAttributeOptions);
      logger.info({ moduleName, methodName, results });
    }
  }

  return ['OK'];
}
