// https://api.akeneo.com/api-reference.html#Measurefamily

import { Unit } from './Unit';

export interface MeasureFamily {
  code: string;
  standard?: string;
  units?: Unit[];
}
