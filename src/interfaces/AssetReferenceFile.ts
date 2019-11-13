// https://api.akeneo.com/api-reference.html#Assetreferencefile

export interface AssetReferenceFileHref {
  href: string;
}

export interface AssetReferenceFileLink {
  download: AssetReferenceFileHref;
}

export interface AssetReferenceFile {
  code?: string;
  locale?: string;
  _link?: AssetReferenceFileLink;
}
