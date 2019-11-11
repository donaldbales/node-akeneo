// https://api.akeneo.com/api-reference.html#Referenceentityattributeoption

import { Label } from './Label';

// NOTE: I had to add reference_entity_code and attriibute_code to this structure
//       otherwise it would not identify it's parent relationship correctly.
export interface ReferenceEntityAttributeOption {
  reference_entity_code: string;
  attribute_code: string;
  code: string;
  labels?: Label[];
}
