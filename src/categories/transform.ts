import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { inspect } from '../inspect';
import { Category } from '../interfaces/Category';

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'catgories/transform';

export async function categories(logger: Logger, data: any) {
  const methodName: string = 'categories';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any = [];

  for (const datum of data) {
    const code = akeneo.attributeCode(datum.code);
    const label = datum.label;
    const parent = akeneo.attributeCode(datum.parent);
    logger.debug({ moduleName, methodName }, `${parent},${code},${label}`);
    const category: Category = {
      code,
      labels: {en_US: label},
      parent
    };
    results.push(category);
  }

  return results;
}
