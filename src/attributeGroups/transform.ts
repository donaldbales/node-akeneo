import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as path from 'path';
import Logger from 'bunyan';

import { AttributeGroup } from '../interfaces/AttributeGroup';

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'attributeGroups/transform';

export async function attributeGroups(logger: Logger, groups: any[]) {
  const methodName: string = 'attributeGroups';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any[] = [];
  let sort_order: number = 0;
  for (const group of groups) {
    sort_order += 10;
    const result: AttributeGroup = {
      code: akeneo.attributeCode(group),
      sort_order,
      labels: {en_US: group}
    };
    results.push(result);
  }

  return results;
}
