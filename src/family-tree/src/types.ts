export type Gender = 0 | 1; // 0=male 1=female
export type RelationValueType = 'parent' | 'partner' | 'children' | 'merge';
export type RelationValueTypeAdjunct = 'of' | 'with';

export enum GenderEnum {
  Male = 0,
  Female = 1,
}

export interface PersonType {
  id: string;
  name: string;
  gender: Gender;
}

export interface RelationType {
  id: string;
  main: string;
  second: string;
  type: 'parent' | 'partner';
}

export interface MetadataType {
  id: string;
  key: string;
  value: string;
  personId: string;
  order: number;
}

export type StoreType = {
  person: PersonType[];
  relation: RelationType[];
  metadata: MetadataType[];
};

export type PersonTreeType = PersonType & {
  highlight?: boolean;

  children: PersonTreeType[];
  partners: PersonType[];
  metadata: MetadataType[];
};
