export interface ScopeLocaleData {
  scope: string;
  locale: string;
  data: any;
}

export interface ProductValue {
  [attribueCode: string]: ScopeLocaleData[];
}
