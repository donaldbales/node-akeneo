// https://api.akeneo.com/api-reference.html#Attribute

import { Label } from './Label';

export interface AttributeNumber {
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
  number_min?: string;
  number_max?: string;
  decimals_allowed: boolean;
  negative_allowed: boolean;
}
