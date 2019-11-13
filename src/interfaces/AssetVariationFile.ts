// https://api.akeneo.com/api-reference.html#Assetvariationfile

export interface AssetVariationFileHref {
  href: string;
}

export interface AssetVariationFileLink {
  download: AssetVariationFileHref;
}

export interface AssetVariationFile {
  code?: string;
  locale?: string;
  scope?: string;
  _link?: AssetVariationFileLink;
}
