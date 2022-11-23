import * as akeneo from 'node-akeneo-api';
import Logger from 'bunyan';

import { Family } from '../interfaces/Family';
import { FamilyVariant } from '../interfaces/FamilyVariant';

const moduleName: string = 'families/load';

export async function families(logger: Logger, data: any[]): Promise<any> {
  const methodName: string = 'families';
  logger.info({ moduleName, methodName }, 'Starting...');

  const famliez: any[] = data;
  const results = await akeneo.patchVndAkeneoCollection(akeneo.apiUrlFamilies(), famliez);
  logger.info({ moduleName, methodName, results });

  return ['OK'];
}
