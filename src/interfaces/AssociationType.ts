// https://api.akeneo.com/api-reference.html#Associationtype

import { Label } from './Label';

export interface AssociationType {
  code: string;
  labels?: Label;
}
