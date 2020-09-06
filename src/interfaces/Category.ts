// https://api.akeneo.com/api-reference.html#Category

import { Label } from './Label';

export interface Category {
  code: string;
  parent?: string;
  labels?: Label;
}
