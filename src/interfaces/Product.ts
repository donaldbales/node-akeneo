// https://api.akeneo.com/api-reference.html#Product

import { ProductAssociation } from './ProductAssociation';
import { ProductValue } from './ProductValue';

export interface Product {
  identifier: string;
  enabled?: boolean;
  family?: string;
  categories?: string[];
  groups?: string[];
  parent?: string;
  values?: ProductValue;
  associations?: ProductAssociation;
}
