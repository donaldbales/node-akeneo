/*
  sql.ts
  by Don Bales
  on 2018-12-21
  A library to connect, execute DLL and DML against SQL Server
*/

/* tslint:disable:no-console */

import Logger from 'bunyan';
import { Connection, ConnectionConfig, ConnectionError } from 'tedious';
import * as fs from 'fs';
import * as tds from 'tedious';
import * as util from 'util';

import { getLogger } from './logger';

const moduleName: string = 'sqlms';

// I create this function to make it easy to develop and debug
function inspect(obj: any, depth: number = 5) {
  return util.inspect(obj, true, depth, false);
}

export function connect(logger: Logger): Promise<any> {
  const methodName: string = 'connect';

  return new Promise((resolve, reject) => {

    logger.info(`${moduleName}#${methodName}: started.`);

    const config: any = process.env.DOCTOSQL_RDBMS ? JSON.parse(process.env.DOCTOSQL_RDBMS) : {};
    const database: string = config.database;
    const password: string = config.password;
    const server: string = config.server;
    const userName: string = config.userName;
    const connectTimeout: number = (config.connectTimeout !== undefined) ?
      Number.parseInt(config.connectTimeout, 10) : 500000; // five minutes
    const requestTimeout: number = (config.requestTimeout !== undefined) ?
      Number.parseInt(config.requestTimeout, 10) : 86399997; // almost 24 hours
    const port: number = (config.port !== undefined) ?
      Number.parseInt(config.port, 10) : 1433;

// The default value for `config.options.trustServerCertificate` will change from `true` to `false` in the next major 
// version of `tedious`. Set the value to `true` or `false` explicitly to silence this message. src/sql.js:68:28

    const connectionConfig: tds.ConnectionConfig = {
      authentication: {
        options: {
          password,
          userName
        },
        type: 'default'
      },
      options: {
        connectTimeout,
        database,
        // If you're on Windows Azure, you will need this:
        encrypt: true,
        port,
        trustServerCertificate: true,
//        validateBulkLoadParameters: false,
        requestTimeout
      },
      server
    };
    
    const connection: Connection = new Connection(connectionConfig);
//    connection.connect();

    connection.on('error', (err: any) => {
      const error: any = err;
      console.error(`${moduleName}#${methodName}: ${inspect(error)}`);
      setTimeout(() => {
        process.exit(99);
      }, 5000);
    });

    connection.on('connect', (err: any) => {
      if (err) {
        const error: any = err;
        console.error(`${moduleName}#${methodName}: ${inspect(error)}`);
        return reject({ error });
      } else {
        return resolve(connection);
      }
    });
  });
}

export function executeDDL(logger: Logger, conn: any, sql: string): Promise<any> {
  const methodName: string = 'executeDDL';

  return new Promise((resolve, reject) => {
    logger.info(`${moduleName}, ${methodName}: start`);

    const results: any[] = [];

    if (sql) {
      const sqlRequest = new tds.Request(
        sql,
        (sqlerr: any, rowCount: any) => {
          if (sqlerr) {
            logger.error(`${moduleName}, ${methodName} \n${inspect(sqlerr)}`);
            return reject({ error: sqlerr });
          } else {
            logger.info(`${moduleName}, ${methodName}: ${rowCount} rows`);
          }
        });

      logger.info(`${moduleName}, ${methodName}: sql=\n${sql}`);

      sqlRequest.on('row', (columns: any) => {
        logger.debug(`${moduleName}, ${methodName}: on row, columns=${inspect(columns)}`);
        results.push({ value: columns[0].value });
      });

      sqlRequest.on('requestCompleted', () => {
        logger.debug(`${moduleName}, ${methodName} on requestCompleted`);
        return resolve(results);
      });

      conn.execSql(sqlRequest);
    } else {
      resolve(results);
    }
  });
}

export function executeDML(logger: Logger, conn: any, sql: string, params: any[] = []): Promise<any> {
  const methodName: string = 'executeDML';
  logger.info(`${moduleName}, ${methodName}: start`);

  return new Promise((resolve, reject) => {
    const startTime: number = Date.now();
    const results: any[] = [];
    let rowsAffected: number = 0;

    if (sql) {
      const sqlRequest = new tds.Request(
        sql,
        (sqlerr: any, rowCount: any) => {
          if (sqlerr) {
            // logger.error(`${moduleName}, ${methodName} error: \n${inspect(sqlerr)}`);
            return reject({ error: sqlerr });
          } else {
            const stopTime: number = Date.now();
            const elapsedTimeInSeconds = (stopTime - startTime) / 1000.
            rowsAffected = rowCount;
            logger.info(`${moduleName}, ${methodName}: ${rowCount} rows, ${elapsedTimeInSeconds} seconds`);
          }
        });

      logger.debug(`${moduleName}, ${methodName}: sql=\n${sql}`);

      if (params &&
          params.length > 0) {
        for (const param of params) {
          sqlRequest.addParameter(param[0], tds.TYPES.VarChar, param[1]);
        }
      }

      sqlRequest.on('row', (columns: any) => {
        // logger.debug(`${moduleName}, ${methodName}: on row`);

        const result: any = {};
        for (const column of columns) {
          // logger.info(`${moduleName}, ${methodName}: column_name=${column.metadata.colName}`);
          // logger.info(`${moduleName}, ${methodName}: value=${inspect(column.value)}`);
          // logger.info(`${moduleName}, ${methodName}: javascript type=${typeof column.value}`);
          // logger.info(`${moduleName}, ${methodName}: tds type=${column.metadata.type.name}`);
          let value: any;

          switch (column.metadata.type.name) {
          case 'BigInt':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'Bit':
            value = column.value !== null ? column.value : null;
            break;
          case 'BitN':
            value = column.value !== null ? column.value : null;
            break;
          case 'Char':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'Date':
            value = column.value !== null ? new Date(column.value.toString()) : null;
            break;
          case 'DateTime':
            value = column.value !== null ? new Date(column.value.toString()) : null;
            break;
          case 'DateTime2':
            value = column.value !== null ? new Date(column.value.toString()) : null;
            break;
          case 'DateTimeN':
            value = column.value !== null ? new Date(column.value.toString()) : null;
            break;
          case 'DateTimeOffset':
            value = column.value !== null ? new Date(column.value.toString()) : null;
            break;
          case 'DecimalN':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'FloatN':
            value = column.value !== null ? column.value : null;
            break;
          case 'Int':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'IntN':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'NumericN':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'SmallInt':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'VarBinary':
            value = column.value !== null ? column.value : null;
            break;
          case 'NVarChar':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'UniqueIdentifier':
            value = column.value !== null ? column.value.toString() : null;
            break;
          case 'VarChar':
            value = column.value !== null ? column.value.toString() : null;
            break;
          default:
            value = column.value !== null ? column.value.toString() : null;
            logger.error(`${moduleName}, ${methodName}: ` +
              `Unsupported data type: ` +
              `column name=${column.metadata.colName}, ` +
              `tds type=${column.metadata.type.name}`);
          }
          result[column.metadata.colName] = value;
        }
        results.push(result);
      });

      sqlRequest.on('requestCompleted', () => {
        logger.debug(`${moduleName}, ${methodName} on requestCompleted`);        
        if (results.length === 0 && 
            sql.trim().toLowerCase().indexOf('select') !== 0) {
          results.push({ rowsAffected });
        }
        return resolve(results);
      });

      conn.execSql(sqlRequest);
    } else {
      resolve(results);
    }
  });
}

// A main method with no command line parameter management
async function main(loggerIn: any = null): Promise<any> {
  const methodName: string = 'main';
  let logger = (loggerIn) ? loggerIn : getLogger(moduleName);
  logger.info(`${moduleName}, ${methodName}, Starting...`);

  const conn: any = await connect(logger);

  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 3000);
  }

  logger.info(`${moduleName}, ${methodName}, Ending.`);
  
  conn.end();
}

// Start the program
if (require.main === module) {
  main();
}
