import Logger from 'bunyan';

import * as akeneo from '../akeneo';
import * as http from '../http';
import { Family } from '../interfaces/Family';
import { FamilyVariant } from '../interfaces/FamilyVariant';

const moduleName: string = 'families/load';

export async function families(logger: Logger, data: any[]): Promise<any> {
  const methodName: string = 'families';
  logger.info({ moduleName, methodName }, 'Starting...');

  const famliez: any[] = data;
  const results = await http.patchVndAkeneoCollection(akeneo.apiUrlFamilies(), famliez);
  logger.info({ moduleName, methodName, results });

  return ['OK'];
}
