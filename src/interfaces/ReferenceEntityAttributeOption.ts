// https://api.akeneo.com/api-reference.html#Referenceentityattributeoption

import { Label } from './Label';

// NOTE: I had to add reference_entity_code and attribute_code to this structure
//       otherwise it would not identify it's parent relationship correctly.
export interface ReferenceEntityAttributeOption {
  code: string;
  labels?: Label;
  delete_reference_entity_code?: string;
  delete_attribute_code?: string;
}
