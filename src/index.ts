/* tslint:disable:no-console */

import * as akeneo from 'node-akeneo-api';
import * as fs from 'fs';
import * as minimist from 'minimist';

import { getLogger } from './logger';

const moduleName: string = 'index';

const possibleTasks: string[] = [
  'exportAssetCategories',
  'exportAssetTags',
  'exportAssets',
  'exportAssetFamilies',
  'exportAssociationTypes',
  'exportAttributeGroups',
  'exportAttributes',
  'exportCategories',
  'exportChannels',
  'exportCurrencies',
  'exportFamilies',
  'exportFamilyVariants',
  'exportLocales',
  'exportMeasureFamilies',
  'exportProductModels',
  'exportProducts',
  'exportReferenceEntities',
  'importAssociationTypes',
  'importAttributeGroups',
  'importAttributeOptions',
  'importAttributes',
  'importCategories',
  'importChannels',
  'importFamilies',
  'importFamilyVariants',
  'importProductModels',
  'importProducts',
  'importReferenceEntities',
  'importReferenceEntityAttributeOptions',
  'importReferenceEntityAttributes',
  'importReferenceEntityRecords'
];

function argz(args: any = null): any {
  const methodName: string = 'argz';

  // console.error(`${moduleName}#${methodName}: Starting...`);
  // console.error(inspect(args)); 
  // console.error(inspect(process.argv.slice(2)));

  const localArgs = minimist(args && args.length > 0 ? args : process.argv.slice(2), {
    alias: {
      h: 'help',
      p: 'parameter',
      t: 'tasks',
      v: 'version'
    },
    default: {
      t: 'exportProducts'
    }
  });
  const pkg: any  = JSON.parse(fs.readFileSync('package.json').toString());
  const name: string = pkg.name ? pkg.name : '';
  const version: string = pkg.version ? pkg.version : '';
  if (localArgs.version) {
    console.log(`${version}`);
    process.exit(0);
  }
  if (localArgs.help) {
    console.log(`Usage: node src/index [options]\n`);
    console.log(`Options:`);
    console.log(`  -h, --help     print ${name} command line options`);
    console.log(`  -t, --tasks    specify task(s) to run: ${possibleTasks.join(', ')}.`);
    console.log(`  -v, --version  print ${name} version`);
    process.exit(0);
  }
  const parameter: string = localArgs.parameter ? localArgs.parameter.toString() : '';
  const result: any = { tasks: {}, parameter };
  const tasks: any[] = localArgs.tasks.split(',');
  // console.error(tasks);
  for (const task of tasks) {
    let found: boolean = false;
    for (const possibleTask of possibleTasks) {
      if (possibleTask === task) {
        found = true;
        break;
      }
    }
    if (found) {
      result.tasks[task] = true;
    } else {
      console.error(`Task: ${task}, is not in the list of supported tasks: ${possibleTasks.join(', ')}.`);
      setTimeout(() => { process.exit(1); }, 10000);
    }
  }
  return result;
}

export default async function main(...args: any[]): Promise<any> {
  const methodName: string = 'main';
  console.log(`${moduleName}#${methodName}: Starting...`);
  const logger: any = getLogger('ex-logger');
  const loggerLevel: string = (process.env.LOG_LEVEL as string) || 'info';
  logger.level(loggerLevel);
  /*
  logger.trace({moduleName, methodName, logger});
  logger.debug({moduleName, methodName, logger});
  logger.info({moduleName, methodName, logger});
  logger.warn({moduleName, methodName, logger});
  logger.error({moduleName, methodName, logger});
  logger.fatal({moduleName, methodName, logger});
  */

  const cla: any = argz(args);
  const tasks: any = cla.tasks;

  let results: any = [];
  results = (tasks.importAssociationTypes) ? await akeneo.importAssociationTypes() : [];
  results = (tasks.importAttributes) ? await akeneo.importAttributes() : [];
  results = (tasks.importAttributeGroups) ? await akeneo.importAttributeGroups() : [];
  results = (tasks.importAttributeOptions) ? await akeneo.importAttributeOptions() : [];
  results = (tasks.importCategories) ? await akeneo.importCategories() : [];
  results = (tasks.importChannels) ? await akeneo.importChannels() : [];
  // TODO: results = (tasks.importCurrencies) ? await akeneo.importCurrencies() : [];
  results = (tasks.importFamilies) ? await akeneo.importFamilies() : [];
  results = (tasks.importFamilyVariants) ? await akeneo.importFamilyVariants() : [];
  // TODO: results = (tasks.importLocales) ? await akeneo.importLocales() : [];
  // TODO: results = (tasks.importMeasureFamilies) ? await akeneo.importMeasureFamilies() : [];
  results = (tasks.importProducts) ? await akeneo.importProducts() : [];
  results = (tasks.importProductModels) ? await akeneo.importProductModels() : [];
  results = (tasks.importReferenceEntities) ? await akeneo.importReferenceEntities() : [];
  results = (tasks.importReferenceEntityAttributes) ? await akeneo.importReferenceEntityAttributes() : [];
  results = (tasks.importReferenceEntityAttributeOptions) ? await akeneo.importReferenceEntityAttributeOptions() : [];
  results = (tasks.importReferenceEntityRecords) ? await akeneo.importReferenceEntityRecords() : [];
  // TODO: results = (tasks.importAssets) ? await akeneo.importAssets() : [];
  // TODO: results = (tasks.importAssetCategories) ? await akeneo.importAssetCategories() : [];
  // TODO: results = (tasks.importAssetReferenceFiles) ? await akeneo.importAssetReferenceFiles() : [];
  // TODO: results = (tasks.importAssetTags) ? await akeneo.importAssetTags() : [];
  // TODO: results = (tasks.importAssetVariationFiles) ? await akeneo.importAssetVariationFiles() : [];
  results = (tasks.exportAssociationTypes) ? await akeneo.exportAssociationTypes() : [];
  results = (tasks.exportAttributes) ? await akeneo.exportAttributes() : [];
  results = (tasks.exportAttributeGroups) ? await akeneo.exportAttributeGroups() : [];
  results = (tasks.exportAttributeOptions) ? await akeneo.exportAttributeOptions(cla.parameter) : [];
  results = (tasks.exportCategories) ? await akeneo.exportCategories() : [];
  results = (tasks.exportChannels) ? await akeneo.exportChannels() : [];
  results = (tasks.exportCurrencies) ? await akeneo.exportCurrencies() : [];
  results = (tasks.exportFamilies) ? await akeneo.exportFamilies() : [];
  results = (tasks.exportFamilyVariants) ? await akeneo.exportFamilyVariants(cla.parameter) : [];
  results = (tasks.exportLocales) ? await akeneo.exportLocales() : [];
  results = (tasks.exportMeasureFamilies) ? await akeneo.exportMeasureFamilies() : [];
  results = (tasks.exportProducts) ? await akeneo.exportProducts() : [];
  results = (tasks.exportProductModels) ? await akeneo.exportProductModels() : [];
  // TODO: results = (tasks.exportPublishedProduct) ? await akeneo.exportPublishedProduct() : [];
  // TODO: results = (tasks.exportProductMediaFile) ? await akeneo.exportProductMediaFile() : [];
  results = (tasks.exportReferenceEntities) ? await akeneo.exportReferenceEntities() : [];
  results = (tasks.exportReferenceEntityAttributes) ? await akeneo.exportReferenceEntityAttributes(cla.parameter) : [];
  // this requires more than one parameter
  // results = (tasks.exportReferenceEntityAttributeOptions) ? await akeneo.exportReferenceEntityAttributeOptions(cla.parameter) : [];
  results = (tasks.exportReferenceEntityRecords) ? await akeneo.exportReferenceEntityRecords(cla.parameter) : [];
  // TODO: results = (tasks.exportReferenceEntityMediaFile) ? await akeneo.exportReferenceEntityMediaFile() : [];
  results = (tasks.exportAssets) ? await akeneo.exportAssets() : [];
  results = (tasks.exportAssetCategories) ? await akeneo.exportAssetCategories() : [];
  // TODO: results = (tasks.exportAssetReferenceFiles) ? await akeneo.exportAssetReferenceFiles() : [];
  results = (tasks.exportAssetTags) ? await akeneo.exportAssetTags() : [];
  // TODO: results = (tasks.exportAssetVariationFiles) ? await akeneo.exportAssetVariationFiles() : [];
  results = (tasks.exportAssetFamilies) ? await akeneo.exportAssetFamilies() : [];
}

// Start the program
if (require.main === module) {
  main();
}
