// https://api.akeneo.com/api-reference.html#Attributegroup

import { Label } from './Label';

export interface AttributeGroup {
  code: string;
  sort_order?: number;
  attributes?: string[];
  labels?: Label;
}
