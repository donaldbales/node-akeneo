import Logger from 'bunyan';
import * as akeneo from '../akeneo';
import * as http from '../http';

const moduleName: string = 'categories/load';

export async function categories(logger: Logger, data: any[]): Promise<any> {
  const methodName: string = 'categories';
  logger.info({ moduleName, methodName }, 'Starting...');

  const categoriez: any[] = data;
  const results = await http.patchVndAkeneoCollection(akeneo.apiUrlCategories(), categoriez);
  logger.info({ moduleName, methodName, results });
  
  return ['OK'];
}
