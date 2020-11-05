// https://api.akeneo.com/api-reference.html#Assetattribute

import { Label } from './Label';

export interface AssetFamilyAttribute {
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
  decimals_allowed?: boolean;
  min_value?: string;
  max_value?: string;
  media_type?: string;
  prefix?: string;
  suffix?: string;
  delete_asset_family_code?: string;
}
