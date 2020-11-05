export interface ChannelLocaleData {
  channel: string | null;
  locale: string | null;
  data: any;
}

export interface AssetFamilyAssetValue {
  [attribueCode: string]: ChannelLocaleData;
}
