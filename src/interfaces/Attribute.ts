// https://api.akeneo.com/api-reference.html#Attribute

import { Label } from './Label';

export interface Attribute {
  code: string;
  type: string;
  labels: Label;
  group: string;
  sort_order?: number;
  localizable?: boolean;
  scopable?: boolean;
  available_locales?: string[];
  unique?: boolean;
  useable_as_grid_filter?: boolean;
  max_characters?: number;
  validation_rule?: string;
  validation_regexp?: string;
  wysiwyg_enabled?: boolean;
  number_min?: string;
  number_max?: string;
  decimals_allowed?: boolean;
  negative_allowed?: boolean;
  metric_family?: string;
  default_metric_unit?: string;
  date_min?: string;
  date_max?: string;
  allowed_extensions?: string[];
  max_file_size?: string;
  reference_data_name?: string;
  minimum_input_length?: number;
  auto_option_sorting?: boolean;
}
