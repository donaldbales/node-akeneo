import Logger from 'bunyan';

import * as akeneo from '../akeneo';
import * as http from '../http';
import { Product } from '../interfaces/Product';
import { ProductAssociation } from '../interfaces/ProductAssociation';
import { ProductModel } from '../interfaces/ProductModel';
import { ProductValue } from '../interfaces/ProductValue';

const moduleName: string = 'products/load';

export async function products(logger: Logger, data: any[]): Promise<any> {
  const methodName: string = 'products';
  logger.info({ moduleName, methodName }, 'Starting...');

  const productz: any[] = data;
  const results = await http.patchVndAkeneoCollection(akeneo.apiUrlProducts(), productz);
  logger.info({ moduleName, methodName, results });

  return ['OK'];
}
