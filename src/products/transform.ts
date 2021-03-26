import Logger from 'bunyan';
import * as fs from 'fs';
import * as path from 'path';

import * as akeneo from '../akeneo';
import { Product } from '../interfaces/Product';

export let defaultCurrency: string = 'USD';
export let defaultGroup: string = 'other';

const exportPath: string = (process.env.AKENEO_EXPORT_PATH as string) || '.';
const moduleName: string = 'products/transform';

const transformedAttributesMap: Map<string, any> = new Map();
function getAttribute(code: string): any {
  if (transformedAttributesMap.size === 0) {
    const data: any = JSON.parse(fs.readFileSync(`${exportPath}${path.sep}transformedAttributes.json`).toString());
    for (const attribute of data.attributes) {
      transformedAttributesMap.set(attribute.code, attribute);
    }
  }
  if (transformedAttributesMap.has(code)) {
    return transformedAttributesMap.get(code);
  } else {
    return false;
  }
}

export async function products(logger: Logger, data: any) {
  const methodName: string = 'products';
  logger.info({ moduleName, methodName }, `Starting...`);

  const results: any = [];

  for (const datum of data) {
    const values: any = {};
    values.sku = [{
      data: datum.PKey,
      locale: null,
      scope: null
    }];
    for (const property in datum) {
      if (datum.hasOwnProperty(property) &&
          datum[property] !== '' &&
          datum[property] !== null &&
          datum[property] !== undefined &&
          property !== akeneo.AKENEO_CATEGORIES &&
          property !== 'currencies' &&
          property !== 'family_name' &&
          property !== 'scopes') {
        if (!(datum.DataSource)) {
          console.error(`No Data Source!`);
          process.exit(99);
        }
        const code: string = akeneo.attributeCode(property);
        const attribute: any = getAttribute(code);
        if (!(attribute)) {
          logger.warn({ moduleName, methodName, attribute: property }, `Unknown attribute skipped!`);
          continue;
        }
 
        let currencies: any[] = datum['currencies'] ? datum['currencies'] : [];
        if (currencies.length === 0 &&
            attribute.currencies &&
            attribute.currencies instanceof Array) {
          currencies = attribute.currencies;
        }
        if (currencies.length === 0) {
          currencies = [ defaultCurrency ];
        }

        const locales: any[] = attribute.available_locales ? attribute.available_locales : [];
        if (attribute.labels &&
            attribute.localizable &&
            locales.length === 0) {
          for (const locale in attribute.labels) {
            locales.push(locale);
          }
        }
        if (locales.length === 0) {
          locales.push(null);
        }
 
        let scopes: any[] = datum['scopes'] ? datum['scopes'].scopes : [];
        if (scopes.length === 0 &&
            attribute.scopes &&
            attribute.scopes instanceof Array) {
          scopes = attribute.scopes;
        }
        if (scopes.length === 0) {
          scopes.push(null);
        }

        if (attribute.type === akeneo.PIM_CATALOG_ASSET_COLLECTION ||
            attribute.type === akeneo.PIM_CATALOG_MULTISELECT ||
            attribute.type === akeneo.AKENEO_REFERENCE_ENTITY_COLLECTION) {
          const data: any[] = [];
          const labels: any[] = datum[property] instanceof Array ? datum[property] : [ datum[property] ];
          for (const label of labels) {
            data.push(akeneo.attributeCode(label));
          }
          values[code] = [];
          for (const locale of locales) {
            for (const scope of scopes) {
              values[code].push({ data, locale, scope });
            }
          }
        } else
        if (attribute.type === akeneo.PIM_CATALOG_SIMPLESELECT ||
            attribute.type === akeneo.AKENEO_REFERENCE_ENTITY) {
          const data = akeneo.attributeCode(datum[property]);
          values[code] = [];
          for (const locale of locales) {
            for (const scope of scopes) {
              values[code].push({ data, locale, scope });
            }
          }
        } else
        if (attribute.type === akeneo.PIM_CATALOG_PRICE_COLLECTION) {
          const amount: number = datum[property];
          const data: any = [];
          for (const currency of currencies) {
            data.push({ amount, currency });
          }
          values[code] = [];
          for (const locale of locales) {
            for (const scope of scopes) {
              values[code].push({ data, locale, scope });
            }
          }
        } else {
          const data: any = datum[property];
          values[code] = [];
          for (const locale of locales) {
            for (const scope of scopes) {
              values[code].push({ data, locale, scope });
            }
          }
        }
      }
    }
    const result: Product = {
      identifier: datum.PKey,
      enabled: true,
      family: akeneo.attributeCode(datum.family_name),
      categories: [],
      values
    };
    if (datum[akeneo.AKENEO_CATEGORIES]) {
      result.categories = [ akeneo.attributeCode(datum[akeneo.AKENEO_CATEGORIES]) ];
    }

    results.push(result);
  }

  return results;
}
