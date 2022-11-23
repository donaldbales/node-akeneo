/* tslint:disable:no-console */

import * as bunyan from 'bunyan';
import * as emailer from './emailer';

import { inspect } from './inspect';

let logger: any;
const moduleName: string = 'logger';

function emailError(err: any = null) {
  const methodName: string = 'emailError';
  if (err) {
    const bound: any = logger.error.bind(logger);
    emailer.sendCallback(inspect(err), 'Error', bound);
  }
}

export function getLogger(name: string): any {
  if (!logger) {
    logger = bunyan.createLogger({ name });
  }
  // wrapper
  const result = {
    debug: logger.debug.bind(logger),
    error: logger.error.bind(logger), //emailError,
    fatal: emailError,
    info: logger.info.bind(logger),
    level: logger.level.bind(logger),
    trace: logger.trace.bind(logger),
    warn: logger.warn.bind(logger)
  };
  return result;
}
