// https://api.akeneo.com/api-reference.html#Referenceentity

import { Label } from './Label';

export interface ReferenceEntity {
  code: string;
  labels?: Label;
  image?: string;
}
