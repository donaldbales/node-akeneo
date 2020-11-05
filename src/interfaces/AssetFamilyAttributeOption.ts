// https://api.akeneo.com/api-reference.html#Assetattributeoption

import { Label } from './Label';

export interface AssetFamilyAttributeOption {
  code: string;
  labels?: Label;
  delete_asset_family_code?: string;
  delete_attribute_code?: string;
}
