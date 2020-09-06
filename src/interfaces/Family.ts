// https://api.akeneo.com/api-reference.html#Family

import { AttributeRequirement } from './AttributeRequirement';
import { Label } from './Label';

export interface Family {
  code: string;
  attribute_as_label: string;
  attribute_as_image?: string;
  attributes?: string[];
  attributes_requirements?: AttributeRequirement;
  labels?: Label;
}
