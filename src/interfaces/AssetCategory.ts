// https://api.akeneo.com/api-reference.html#Assetcategory

import { Label } from './Label';

export interface AssetCategory {
  code: string;
  parent?: string;
  labels?: Label;
}
