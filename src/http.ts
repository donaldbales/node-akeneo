import Logger from 'bunyan';
import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as FormData from 'form-data';
import * as qs from 'qs';
import { consoleTestResultsHandler } from 'tslint/lib/test';
import * as util from 'util';

import { inspect } from './inspect';
import { getLogger } from './logger';

const logger: Logger = getLogger('node-akeneo');
const moduleName: string = 'http';

const clientId: string = (process.env.AKENEO_CLIENT_ID as string) || '';
const secret: string = (process.env.AKENEO_SECRET as string) || '';
const username: string = (process.env.AKENEO_USERNAME as string) || '';
const password: string = (process.env.AKENEO_PASSWORD as string) || '';
const baseUrl: string = (process.env.AKENEO_BASE_URL as string) || 'http://akeneo-pim.local';
const tokenUrl: string = (process.env.AKENEO_TOKEN_URL as string) || '/api/oauth/v1/token';
const patchLimit: number = Number.parseInt((process.env.AKENEO_PATCH_LIMIT as string) || '100', 10);
const FIVE_MINUTES: number = 5 * 60 * 1000;

let tokenResponse: any;
let tokenExpiresAt: number = 0;
async function getToken(): Promise<any> {
  const methodName: string = 'getToken';
  logger.trace({ moduleName, methodName }, `Starting...`);

  if (tokenResponse &&
      tokenExpiresAt > Date.now() + FIVE_MINUTES) {
    return tokenResponse.access_token;
  } else {
    const data: any = qs.stringify({
      grant_type: `password`,
      password,
      username
    });
    const encodedClientIdSecret: string = Buffer.from(`${clientId}:${secret}`).toString('base64');
    const basicAuthorization = `Basic ${encodedClientIdSecret}`;
    const options: any = {
      headers: {
        'Authorization': basicAuthorization,
        'Content-Type': `application/x-www-form-urlencoded`
      }
    };
    let response: any = {};
    const url: string = `${baseUrl}${tokenUrl}`;
    try {
      const tokenRequestedAt: number = Date.now();
      response = await axios.post(url, data, options);
      logger.trace({ moduleName, methodName }, `response=\n${inspect(response)}`);

      tokenResponse = response.data ? response.data : {};
      tokenExpiresAt = tokenRequestedAt + (tokenResponse.expires_in * 1000);
      logger.trace({ moduleName, methodName }, `tokenResponse=\n${inspect(tokenResponse)}`);
      return tokenResponse.access_token;
    } catch (err) {
      logger.error({ moduleName, methodName, err });
      return '';
    }
  }
}

export async function get(apiUrl: string, callback: any = null): Promise<any> {
  const methodName: string = 'get';
  logger.info({ moduleName, methodName, apiUrl }, `Starting...`);
  const options: any = {
    headers: {
      'Authorization': 'none',
      'Content-Type': `application/json`
    }
  };
  let response: any = {};
  let results: any[] = [];
  let url: string = apiUrl.indexOf('?') === -1 ? `${baseUrl}${apiUrl}?limit=100` : `${baseUrl}${apiUrl}&limit=100`;

  for ( ; ; ) {
    const accessToken = await getToken();
    options.headers.Authorization = `Bearer ${accessToken}`;
    try {
      response = await axios.get(url, options);
      logger.trace({ moduleName, methodName }, `response=\n${inspect(response)}`);

      const pageResponse = response.data ? response.data : {};
      logger.trace({ moduleName, methodName }, `pageResponse=\n${inspect(pageResponse)}`);
      // console.log(pageResponse);
      if (pageResponse &&
          pageResponse._embedded &&
          pageResponse._embedded.items) {
        // console.log(pageResponse._embedded.items);
        for (const item of pageResponse._embedded.items) {
          if (item._links) {
            delete item._links;
          }
          results.push(item);
        }
        if (callback) {
          callback(results);
          results = [];
        }
      } else
      if (pageResponse instanceof Array) {
        for (const item of pageResponse) {
          if (item._links) {
            delete item._links;
          }
          results.push(item);
        }
        if (callback) {
          callback(results);
          results [];
        }
      }

      if (pageResponse &&
          pageResponse._links &&
          pageResponse._links.next &&
          pageResponse._links.next.href) {
        // console.log(pageResponse._links.next.href);
        url = pageResponse._links.next.href;
      } else {
        url = '';
      }
    } catch (err) {
      if (err.response &&
          err.response.data &&
          err.response.data.message) {
        logger.info({ moduleName, methodName, url }, `${err.response.data.message}`);
      }

      if (err.response &&
          err.response.status &&
          err.response.status === 404) {
        url = '';
      } else {
        logger.error({ moduleName, methodName, err });
        return err;
      }
    }
    if (url === '') {
      break;
    }
  }
  return results;
}

export async function patch(apiUrl: string, data: any): Promise<any> {
  const methodName: string = 'patch';
  const docs = { length: (typeof(data) === 'object' && data instanceof Array ? data.length : 1) };
  logger.info({ moduleName, methodName, apiUrl, docs: docs.length }, `Starting...`);
  const accessToken: string = await getToken();
  const options: any = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `application/json`
    }
  };
  let response: any = {};
  const results: any[] = [];
  const url: string = `${baseUrl}${apiUrl}`;
  try {
    const buffer: Buffer = Buffer.from(JSON.stringify(data));
    response = await axios.patch(url, buffer, options);
    logger.trace({ moduleName, methodName }, `response=\n${inspect(response)}`);
    // console.log(response.status);

    const pageResponse = response.data ? response.data : {};
    logger.trace({ moduleName, methodName }, `pageResponse=\n${pageResponse}`);
    // console.log(pageResponse);

    if (pageResponse &&
        typeof(pageResponse) === 'object' &&
        pageResponse instanceof Array) {
      const lines: any[] = pageResponse;
      if (lines.length !== data.length) {
        logger.warn({ moduleName, methodName, data: data.length, lines: lines.length }, `line count difference!`);
      } /*
      for (let j = 0; j < lines.length; j++) {
        if (lines[j] && lines[j].status_code && lines[j].status_code >= 300) {
          logger.info({ moduleName, methodName,
            line: JSON.parse(JSON.stringify(lines[j])),
            data: JSON.parse(JSON.stringify(data[j])) });
        }
      } */
    }
  } catch (err) {
    logger.info({ moduleName, methodName, err });
    return err;
  }

  return results;
}

export async function patchVndAkeneoCollection(apiUrl: string, docs: any[]): Promise<any> {
  const methodName: string = 'patchVndAkeneoCollection';
  logger.info({ moduleName, methodName, apiUrl, docs: docs.length }, `Starting...`);
  const accessToken: string = await getToken();
  const options: any = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `application/vnd.akeneo.collection+json`
    }
  };
  let response: any = {};
  const results: any[] = [];
  const url: string = `${baseUrl}${apiUrl}`;

  let data: string[] = [];
  for (let i = 0; i < docs.length; i++) {
    data.push(`${JSON.stringify(docs[i])}`);

    if ((1 + i) % patchLimit === 0 ||
         1 + i === docs.length) {
      // console.log(`\n\n${data}\n\n`);
      try {
        const buffer: Buffer = Buffer.from(`${data.join('\n')}\n`);
        response = await axios.patch(url, buffer, options);
        logger.trace({ moduleName, methodName }, `response=\n${inspect(response)}`);

        const pageResponse = response.data ? response.data : {};
        logger.trace({ moduleName, methodName }, `pageResponse=\n${pageResponse}`);

        if (pageResponse) {
          let lines: any[] = [];
          try {
            if (typeof(pageResponse) === 'object') {
              lines = JSON.parse(`[ ${JSON.stringify(pageResponse)} ]`);
            } else {
              lines = JSON.parse(`[ ${pageResponse.replace(/\n/gi, ', ')} ]`);
            }
            // console.log(lines);
          } catch (err) {
            logger.warn({ moduleName, methodName, err, pageResponse}, `Converting response into lines.`);
            lines = [];
          }
          if (lines.length !== data.length) {
            logger.warn({ moduleName, methodName, data: data.length, lines: lines.length }, `line count difference!`);
          }
          for (let j = 0; j < lines.length; j++) {
            if (lines[j] && lines[j].status_code && lines[j].status_code >= 300) {
              /* tslint:disable:object-literal-sort-keys */
              logger.info({ moduleName, methodName,
                line: JSON.parse(JSON.stringify(lines[j])),
                data: JSON.parse(data[j]) });
              /* tslint:enable:object-literal-sort-keys */
            }
          }
        }
      } catch (err) {
        logger.info({ moduleName, methodName, err });
        return err;
      }
      data = [];
    }
  }
  return results;
}

export async function postMultipartFormData(path: string, stream: any): Promise<any> {
  const methodName: string = 'postMultipartFormData';
  if (!(stream)) {
    logger.error({ moduleName, methodName, apiUrl: path }, `No Stream`);
  } else {
    // console.log(inspect(stream));
  }
  logger.info({ moduleName, methodName, apiUrl: path, stream: stream.length }, `Starting...`);

  const accessToken: string = await getToken();
  const splitBaseUrl: any[] = baseUrl.split('/') 
  const host: string = splitBaseUrl[2];
  const protocol: string = splitBaseUrl[0];
  // console.log(`${protocol}//${host}`);

  return new Promise((resolve, reject) => {
    const form: any = new FormData();
    form.append('file', stream);
    form.submit({
      protocol,
      host,
      path,
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }, (err: any, res: any) => {
      if (err) {
        const error: string = err.message ? err.message : inspect(err);
        logger.error({ moduleName, methodName, apiUrl: path, error }, `Error`);
        reject(err);
      } else {
        const statusCode: number = res.statusCode;
        const statusMessage: string = res.statusMessage;
        logger.info({ moduleName, methodName, apiUrl: path, statusCode });
        logger.info({ moduleName, methodName, apiUrl: path, statusMessage });
	      if (statusCode !== 201) {
          for (const property in res) {
            if (res.hasOwnProperty(property)) {
              logger.info({ moduleName, methodName, apiUrl: path, property, value: res[property] });
            }
          }
        }
        const headers = res.headers;
        if (headers['location']) {
          const location = headers['location'];
          logger.info({ moduleName, methodName, apiUrl: path, location });
        }
        let assetMediaFileCode: string = '';
        if (headers['asset-media-file-code']) {
          assetMediaFileCode = headers['asset-media-file-code'];
          logger.info({ moduleName, methodName, apiUrl: path, assetMediaFileCode });
        }
        let referenceEntitiesMediaFileCode: string = '';
        if (headers['reference-entities-media-file-code']) {
          referenceEntitiesMediaFileCode = headers['reference-entities-media-file-code'];
          logger.info({ moduleName, methodName, apiUrl: path, referenceEntitiesMediaFileCode });
        }
        if (statusCode !== 201) {
          reject(`${statusCode}: ${statusMessage}`);
        } else
        if (assetMediaFileCode) {
          resolve(assetMediaFileCode);
        } else
        if (referenceEntitiesMediaFileCode) {
          resolve(referenceEntitiesMediaFileCode);
        } else {
          resolve('');
        }
      }
    });
  });
}

// A main method with no command line parameter management
async function main(): Promise<any> {
  const methodName: string = 'main';
  logger.info({ moduleName, methodName }, `Starting...`);

  let unUsedLocal: any;

  unUsedLocal = await getToken();
  logger.info({ moduleName, methodName, unUsedLocal });

  unUsedLocal = await getToken();
  logger.info({ moduleName, methodName, unUsedLocal });

  unUsedLocal = await get('/api/rest/v1/attributes');
  logger.info({ moduleName, methodName, unUsedLocal });

  unUsedLocal = await patch('/api/rest/v1/attributes', unUsedLocal);
  logger.info({ moduleName, methodName, unUsedLocal });

  if (require.main === module) {
    setTimeout(() => { process.exit(0); }, 10000);
  }

  logger.info({ moduleName, methodName }, `Ending.`);
}

// Start the program
if (require.main === module) {
  main();
}
