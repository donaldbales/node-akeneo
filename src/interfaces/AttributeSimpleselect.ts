// https://api.akeneo.com/api-reference.html#Attribute

import { Label } from './Label';

export interface AttributeSimpleselect {
  code: string;
  type: string;
  labels: Label;
  group: string;
  sort_order: number;
  localizable: boolean;
  scopable: boolean;
  available_locales?: string[];
  unique: boolean;
  useable_as_grid_filter: boolean;
  minimum_input_length?: number;
  auto_option_sorting: boolean;
}
