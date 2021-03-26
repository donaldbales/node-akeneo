/*
  sql.ts
  by Don Bales
  on 2018-12-21
  A library to connect, execute DLL and DML against MySQL
*/

/* tslint:disable:no-console */

import Logger from 'bunyan';
import { ConnectionConfig, MysqlError } from 'mysql';
import * as fs from 'fs';
import * as mysql from 'mysql';
import * as util from 'util';

import { getLogger } from './logger';

const moduleName: string = 'sqlmy';

export function connect(logger: Logger): Promise<any> {
  const methodName: string = 'connect';
  
  return new Promise((resolve, reject) => {

    logger.info(`${moduleName}#${methodName}: started.`);
  
    const user: string = (process.env.MYSQL_USER as string) || '';
    const password: string = (process.env.MYSQL_PASSWORD as string) || '';
    const database: string = (process.env.MYSQL_DATABASE as string) || '';
    const charset: string = (process.env.MYSQL_CHARSET as string) || 'UTF8_GENERAL_CI';
    const timeout: number = Number.parseInt((process.env.MYSQL_TIMEOUT as string) || '60000');
    const host: string = (process.env.MYSQL_HOST as string) || 'localhost';
    const port: number = Number.parseInt((process.env.MYSQL_PORT as string) || '3306');
    const timezone: string = (process.env.MYSQL_TIMEZONE as string) || 'local';
    const connectTimeout: number = Number.parseInt((process.env.MYSQL_CONNECT_TIMEOUT as string) || '10000');
    const sslCa: string = (process.env.MYSQL_SSL_CA as string) || '';
    const sslRejectUnauthorized: string = (process.env.MYSQL_SSL_VERIFY_SERVER_CERT as string) || '';

    const config: ConnectionConfig = {
      charset,
      timeout,
      host,
      port,
      timezone,
      connectTimeout,
      supportBigNumbers: true,
      bigNumberStrings: true
    };
    if (user) {
      config.user = user;
    }
    if (password) {
      config.password = password;
    }
    if (database) {
      config.database = database;
    }
    if (sslCa) {
      const ca: string = sslCa;
      const rejectUnauthorized: boolean = (sslRejectUnauthorized === '1') ? true : false;
      config.ssl = { 
        ca,
        rejectUnauthorized
      }
    }
    const connection = mysql.createConnection(config);
    
    connection.connect((err: MysqlError) => {
      const error = err;
      if (error) {
        reject(error);
      } else {
        resolve(connection);
      }
    });
  });
}

export function executeDDL(logger: Logger, conn: any, sql: string): Promise<any> {
  const methodName: string = 'executeDDL';

  return new Promise((resolve, reject) => {
    logger.info(`${moduleName}, ${methodName}: start`);
  
    let rowsAffected: number = 0;
    
    if (sql) {
      conn.query(sql, (error: any, results: any, fields: any) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    }
  });
}

export function executeDML(logger: Logger, conn: any, sql: string, values: any[] = []): Promise<any> {
  const methodName: string = 'executeDML';

  return new Promise((resolve, reject) => {
    logger.info(`${moduleName}, ${methodName}: start`);
  
    let rowsAffected: number = 0;
    
    if (sql) {
      conn.query({ sql, values }, (error: any, results: any, fields: any) => {
        if (error) {
          console.error(error);
          reject(error);
        } else {
          if (results) {
            resolve(results);
          } else
          if (fields) {
            resolve(fields);  
          } else {
            resolve([]);
          }
        }
      });
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
