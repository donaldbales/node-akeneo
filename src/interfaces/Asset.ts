// https://api.akeneo.com/api-reference.html#Asset

export interface Asset {
  code: string;
  categories?: string[];
  description?: string;
  localizable?: boolean;
  tags?: string[];
  end_of_use?: string;
  variation_files?: any[];
  reference_files?: any[];
}
