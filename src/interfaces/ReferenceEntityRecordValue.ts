export interface ChannelLocaleData {
  channel: string | null;
  locale: string | null;
  data: any;
}

export interface ReferenceEntityRecordValue {
  [attribueCode: string]: ChannelLocaleData;
}
