import * as util from 'util';

export function inspect(obj: any, depth: number = 5): string {
  return `${util.inspect(obj, true, depth, false)}`;
}
