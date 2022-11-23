import * as akeneo from 'node-akeneo-api';
import Logger from 'bunyan';

const moduleName: string = 'categories/load';

export async function categories(logger: Logger, data: any[]): Promise<any> {
  const methodName: string = 'categories';
  logger.info({ moduleName, methodName }, 'Starting...');

  const categoriez: any[] = data;
  const results = await akeneo.patchVndAkeneoCollection(akeneo.apiUrlCategories(), categoriez);
  logger.info({ moduleName, methodName, results });
  
  return ['OK'];
}
