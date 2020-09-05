// https://api.akeneo.com/api-reference.html#Attribute

import { Label } from './Label';

export interface AttributeTextarea {
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
  max_characters?: number;
  wysiwyg_enabled: boolean;
}
