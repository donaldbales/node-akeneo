/* tslint:disable:no-console */

import { getLogger } from './logger';

const moduleName: string = 'index';

export default async function main(...args: any[]): Promise<any> {
  const methodName: string = 'main';
  console.log(`${moduleName}#${methodName}: Starting...`);
  const logger: any = getLogger('ex-logger');
  logger.level('trace');
  logger.trace({moduleName, methodName, logger});
  logger.debug({moduleName, methodName, logger});
  logger.info({moduleName, methodName, logger});
  logger.warn({moduleName, methodName, logger});
  logger.error({moduleName, methodName, logger});
  logger.fatal({moduleName, methodName, logger});
}

// Start the program
if (require.main === module) {
  main();
}
