import * as akeneo from 'node-akeneo-api';
import Logger from 'bunyan';

import { Product } from '../interfaces/Product';
import { ProductAssociation } from '../interfaces/ProductAssociation';
import { ProductModel } from '../interfaces/ProductModel';
import { ProductValue } from '../interfaces/ProductValue';

const moduleName: string = 'products/load';

export async function products(logger: Logger, data: any[]): Promise<any> {
  const methodName: string = 'products';
  logger.info({ moduleName, methodName }, 'Starting...');

  const productz: any[] = data;
  const results = await akeneo.patchVndAkeneoCollection(akeneo.apiUrlProducts(), productz);
  logger.info({ moduleName, methodName, results });

  return ['OK'];
}
