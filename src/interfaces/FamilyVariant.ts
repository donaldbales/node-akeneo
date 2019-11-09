// https://api.akeneo.com/api-reference.html#Familyvariant

import { Label } from './Label';
import { VariantAttributeSet } from './VariantAttributeSet';

export interface FamilyVariant {
  code: string;
  variant_attribute_sets: VariantAttributeSet[];
  labels?: Label[];
}
