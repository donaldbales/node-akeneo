// https://api.akeneo.com/concepts/asset-manager.html#asset
// https://api.akeneo.com/api-reference.html#Asset

import { AssetFamilyAssetValue } from './AssetFamilyAssetValue';

// NOTE: I had to add reference_entity_code in order to show what this record
//       is related to.
export interface AssetFamilyAsset {
  code: string;
  values: AssetFamilyAssetValue[];
  delete_asset_family_code?: string;
}
