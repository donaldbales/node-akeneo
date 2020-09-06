// https://api.akeneo.com/api-reference.html#Familyvariant

import { Label } from './Label';
import { VariantAttributeSet } from './VariantAttributeSet';

// NOTE: I had to add attribute family. Even though the doc says it's
//       not needed, it doesn't work without it.
export interface FamilyVariant {
  code: string;
  variant_attribute_sets: VariantAttributeSet[];
  labels?: Label;
  family?: string;
}
