// https://api.akeneo.com/api-reference.html#Attributeoption

import { Label } from './Label';

export interface AttributeOption {
  code: string;
  attribute?: string;
  sort_order?: number;
  labels?: Label;
}
