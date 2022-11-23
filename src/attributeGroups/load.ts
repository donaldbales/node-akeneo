import * as akeneo from 'node-akeneo-api';
import Logger from 'bunyan';

import { AttributeGroup } from '../interfaces/AttributeGroup';

const moduleName: string = 'attributesGroup/load';

export async function attributeGroups(logger: Logger, data: any[]) {
  const methodName: string = 'attributeGroups';
  logger.info({ moduleName, methodName }, 'Starting...');

  const attributeGroups: AttributeGroup[] = data;
  const results = await akeneo.patchVndAkeneoCollection(akeneo.apiUrlAttributeGroups(), attributeGroups);
  logger.info({ moduleName, methodName, results });

  return ['OK'];
}
