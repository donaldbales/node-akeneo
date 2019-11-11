export interface GroupsProductsProductModels {
  groups: string[];
  products: string[];
  product_models: string[];
}

export interface ProductAssociation {
  [associationTypeCode: string]: GroupsProductsProductModels;
}
