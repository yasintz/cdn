import React from 'react';
import { RelationValueType, RelationValueTypeAdjunct } from '../types';

type TypeSelectorProps = {
  onChange: (v: RelationValueType) => void;
  val: RelationValueType;
};

export const typeConfig: Record<
  RelationValueType,
  { text: string; adjunct: RelationValueTypeAdjunct }
> = {
  partner: {
    text: 'Partner',
    adjunct: 'with',
  },
  parent: {
    text: 'Parent',
    adjunct: 'of',
  },
  children: {
    text: 'Children',
    adjunct: 'of',
  },
  merge: {
    text: 'Merge',
    adjunct: 'with',
  },
};
const TypeSelector: React.FC<TypeSelectorProps> = ({ onChange, val }) => {
  return (
    <select
      onChange={(e) => onChange(e.target.value as RelationValueType)}
      value={val}
    >
      {Object.entries(typeConfig).map(([type, config]) => (
        <option key={type} value={type}>
          {config.text}
        </option>
      ))}
    </select>
  );
};

export default TypeSelector;
