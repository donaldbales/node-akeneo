// https://api.akeneo.com/api-reference.html#Referenceentityrecord

import { ReferenceEntityRecordValue } from './ReferenceEntityRecordValue';

// NOTE: I had to add reference_entity_code in order to show what this record
//       is related to.
export interface ReferenceEntityRecord {
  code: string;
  values: ReferenceEntityRecordValue[];
  delete_reference_entity_code?: string;
}
