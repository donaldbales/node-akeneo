export interface ChannelLocaleData {
  channel: string;
  locale: string;
  data: any;
}

export interface ReferenceEntityRecordValue {
  [attribueCode: string]: ChannelLocaleData[];
}
