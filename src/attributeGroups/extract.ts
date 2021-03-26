import Logger from 'bunyan';
import * as fs from 'fs';
import * as path from 'path';

const sql: any = require(`..${path.sep}${(process.env.AKENEO_RDBMS_DRIVER as string || 'sqlms')}`);

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'attributeGroups/extract';

export const AG_OTHER: string = 'Other';
export const AG_UNIVERSAL: string = 'Universal';
// export const AG_: string = '';

export async function attributeGroups(logger: Logger) {
  const methodName: string = 'attributeGroups';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any[] = [
    AG_OTHER,
    AG_UNIVERSAL
  ];

  return results;
}
