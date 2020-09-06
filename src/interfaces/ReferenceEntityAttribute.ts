// https://api.akeneo.com/api-reference.html#Referenceentityattribute

import { Label } from './Label';

// NOTE: I had to add delete_reference_entity_code in order to track the parent
//       entity.
export interface ReferenceEntityAttribute {
  code: string;
  labels?: Label;
  type: string;
  value_per_locale?: boolean;
  value_per_channel?: boolean;
  is_required_for_completeness?: boolean;
  max_characters?: number;
  is_textarea?: boolean;
  is_rich_text_editor?: boolean;
  validation_rule?: string;
  validation_regexp?: string;
  allowed_extensions?: string[];
  max_file_size?: string;
  reference_entity_code?: string;
  decimals_allowed?: boolean;
  min_value?: string;
  max_value?: string;
  delete_reference_entity_code?: string;
}
