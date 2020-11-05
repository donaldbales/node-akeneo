// https://api.akeneo.com/api-reference.html#AssetFamily

import { Label } from './Label';

export interface AssetFamily {
  code: string;
  labels?: Label;
  attribute_as_main_media?: string;
  naming_convention?: null;
  product_link_rules?: null;
  transformations?: null;
}
