import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { PersonBuilder } from '../helper/builder';
import { MetadataType, PersonType } from '../types';
import { AppContext } from './ctx';
import { autocomplete } from '../helper/autocomplete';

const StyledItemContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px 0 12px 0;
  & > input {
    width: 80px;
  }
`;

type MetadataItemPropsType = {
  keys: string[];
  metadata: MetadataType;
  onSave: (val: { key: string; value: string }) => void;
};

const MetadataItem = ({ onSave, metadata, keys }: MetadataItemPropsType) => {
  const [key, setKey] = useState(metadata.key);
  const [value, setValue] = useState(metadata.value);
  const keyRef = useRef<HTMLInputElement>(null);

  const isChanged = key !== metadata.key || value !== metadata.value;

  useEffect(() => {
    if (keyRef.current) {
      autocomplete(keyRef.current, keys);
    }
  }, []);

  return (
    <StyledItemContainer>
      <input
        id={metadata.id + 'key'}
        value={key}
        onChange={(e) => setKey(e.target.value)}
        ref={keyRef}
      />
      :
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button
        style={{
          opacity: isChanged ? 1 : 0,
          pointerEvents: isChanged ? 'auto' : 'none',
        }}
        onClick={() => (key && value ? onSave({ key, value }) : undefined)}
      >
        Save
      </button>
    </StyledItemContainer>
  );
};

type MetadataPopupProps = {
  person: PersonType;
};

export const MetadataPopup = ({ person }: MetadataPopupProps) => {
  const { createMetadata, updateMetadata, store } = useContext(AppContext);
  const buildedPerson = useMemo(
    () => new PersonBuilder(person, store),
    [person, store]
  );
  const metadataList = buildedPerson.metadata || [];

  const keys = useMemo(
    () => _.uniq(store.metadata.map((m) => m.key)),
    [store.metadata]
  );

  return (
    <div style={{ padding: 16 }}>
      {metadataList.map((metadata) => (
        <MetadataItem
          keys={keys}
          key={metadata.id}
          metadata={metadata}
          onSave={({ key, value }) =>
            updateMetadata(metadata.id, { key, value })
          }
        />
      ))}

      <button
        onClick={() =>
          person &&
          createMetadata({
            personId: person.id,
            key: '',
            value: '',
            order: metadataList.length,
          })
        }
      >
        Add
      </button>
    </div>
  );
};
