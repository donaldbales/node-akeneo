// https://api.akeneo.com/api-reference.html#Channel

import { ConversionUnit } from './ConversionUnit';
import { Label } from './Label';

export interface Channel {
  code: string;
  locales: string[];
  currencies: string[];
  conversion_units: ConversionUnit;
  labels?: Label;
}
