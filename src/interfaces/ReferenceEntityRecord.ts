// https://api.akeneo.com/api-reference.html#Referenceentityrecord

import { ReferenceEntityRecordValue } from './ReferenceEntityRecordValue';

export interface ReferenceEntityRecord {
  code: string;
  values: ReferenceEntityRecordValue[];
}
