import Logger from 'bunyan';

import * as akeneo from '../akeneo';
import * as http from '../http';
import { AttributeGroup } from '../interfaces/AttributeGroup';

const moduleName: string = 'attributesGroup/load';

export async function attributeGroups(logger: Logger, data: any[]) {
  const methodName: string = 'attributeGroups';
  logger.info({ moduleName, methodName }, 'Starting...');

  const attributeGroups: AttributeGroup[] = data;
  const results = await http.patchVndAkeneoCollection(akeneo.apiUrlAttributeGroups(), attributeGroups);
  logger.info({ moduleName, methodName, results });

  return ['OK'];
}
