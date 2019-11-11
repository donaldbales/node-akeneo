// https://api.akeneo.com/api-reference.html#Productmodel

import { ProductValue } from './ProductValue';

export interface ProductModel {
  code: string;
  family?: string;
  family_variant: string;
  parent?: string;
  categories?: string[];
  values?: ProductValue;
}
