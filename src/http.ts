import axios, { AxiosPromise, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as qs from 'qs';
import * as util from 'util';

import { inspect } from './inspect';
import { getLogger } from './logger';

const logger: any = getLogger('nodeakeneo');
const moduleName: string = 'http';

const clientId: string = (process.env.AKENEO_CLIENT_ID as string) || '';
const secret: string = (process.env.AKENEO_SECRET as string) || '';
const username: string = (process.env.AKENEO_USERNAME as string) || '';
const password: string = (process.env.AKENEO_PASSWORD as string) || '';
const baseUrl: string = (process.env.AKENEO_BASE_URL as string) || 'http://akeneo-pimee.local:8080';
const tokenUrl: string = (process.env.AKENEO_TOKEN_URL as string) || '/api/oauth/v1/token';
const patchLimit: number = Number.parseInt((process.env.AKENEO_PATCH_LIMIT as string) || '100', 10);
let tokenResponse: any;
let tokenExpiresAt: number = 0;

async function getToken(): Promise<any> {
  const methodName: string = 'getToken';
  logger.info({ moduleName, methodName }, `Starting...`);

  if (tokenResponse &&
      tokenExpiresAt > Date.now()) {
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
      // logger.info({ moduleName, methodName }, `response=\n${inspect(response)}`);

      tokenResponse = response.data ? response.data : {};
      tokenExpiresAt = tokenRequestedAt + (tokenResponse.expires_in * 1000);
      // logger.info({ moduleName, methodName }, `tokenResponse=\n${inspect(tokenResponse)}`);
      return tokenResponse.access_token;
    } catch (err) {
      logger.error({ moduleName, methodName, err });
      return '';
    }
  }
}

export async function get(apiUrl: string): Promise<any> {
  const methodName: string = 'get';
  logger.info({ moduleName, methodName }, `Starting...`);
  const accessToken: string = await getToken();
  const options: any = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': `application/json`
    }
  };
  let response: any = {};
  const results: any[] = [];
  let url: string = `${baseUrl}${apiUrl}?limit=100`;

  for ( ; ; ) {
    try {
      response = await axios.get(url, options);
      // logger.info({ moduleName, methodName }, `response=\n${inspect(response)}`);

      const pageResponse = response.data ? response.data : {};
      // logger.info({ moduleName, methodName }, `pageResponse=\n${inspect(pageResponse)}`);
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
      logger.info({ moduleName, methodName, err });
      return err;
    }
    if (url === '') {
      break;
    }
  }
  return results;
}

export async function patch(apiUrl: string, docs: any[]): Promise<any> {
  const methodName: string = 'patch';
  logger.info({ moduleName, methodName }, `Starting...`);
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

  let data: string = '';
  for (let i = 0; i < docs.length; i++) {
    data += `${JSON.stringify(docs[i])}\n`;

    if ((1 + i) % patchLimit === 0 ||
         1 + i === docs.length) {
      // console.log(`\n\n${data}\n\n`);
      try {
        response = await axios.patch(url, Buffer.from(data), options);
        logger.info({ moduleName, methodName }, `response=\n${inspect(response)}`);

        const pageResponse = response.data ? response.data : {};
        logger.info({ moduleName, methodName }, `pageResponse=\n${inspect(pageResponse)}`);
        // console.log(pageResponse);
/*
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
*/
      } catch (err) {
        logger.error({ moduleName, methodName, err });
        return err;
      }
      data = '';
    }
  }
  return results;
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
