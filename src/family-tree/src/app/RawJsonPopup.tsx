import _ from 'lodash';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { PersonBuilder } from '../helper/builder';
import { MetadataType, PersonType } from '../types';
import { AppContext } from './ctx';

const StyledContainer = styled.div`
  width: 350px;
  height: 350px;
  padding: 24px;
  display: flex;
  flex-direction: column;

  & > textarea {
    flex: 1;
  }
  & > button {
    width: 100%;
  }
`;

type RawJsonPopupProps = {
  person: PersonType;
};

type RawJsonType = Pick<PersonType, 'name' | 'gender'> & {
  metadata: Array<Pick<MetadataType, 'key' | 'value' | 'order'>>;
};

export const RawJsonPopup = ({ person }: RawJsonPopupProps) => {
  const {
    createMetadata,
    deleteMetadata,
    updatePerson,
    updateMetadata,
    store,
  } = useContext(AppContext);

  const buildedPerson = useMemo(
    () => new PersonBuilder(person, store),
    [person, store]
  );
  const metadataList = buildedPerson.metadata;
  const raw: RawJsonType = useMemo(
    () => ({
      name: person.name,
      gender: person.gender,

      metadata: metadataList.map((metadata) => ({
        key: metadata.key,
        value: metadata.value,
        order: metadata.order,
      })),
    }),
    [metadataList, person]
  );

  const [rawJson, setRawJson] = useState(JSON.stringify(raw, null, 2));

  const update = () => {
    let json: RawJsonType;
    try {
      json = JSON.parse(rawJson);
    } catch (error) {
      alert('OOPS! Invalid json format');
      return;
    }

    if (!json) {
      return;
    }

    if (json.name !== person.name || json.gender !== person.gender) {
      updatePerson(person.id, { name: json.name, gender: person.gender });
    }

    const newMetadata = _.differenceBy(json.metadata, metadataList, 'key');
    const deletedMetadata = _.differenceBy(metadataList, json.metadata, 'key');

    const updatedMetadata = _.differenceBy(
      json.metadata,
      newMetadata,
      'key'
    ).filter((m) => {
      const old = metadataList.find((m2) => m2.key === m.key);

      return old?.order !== m.order || old.value !== m.value;
    });

    updatedMetadata.forEach((m) => {
      const old = metadataList.find((m2) => m2.key === m.key);
      if (old) {
        updateMetadata(old.id, m);
      }
    });

    deletedMetadata.forEach((metadata) => {
      deleteMetadata(metadata.id);
    });

    newMetadata.forEach((m) => {
      createMetadata({
        key: m.key,
        order: m.order,
        value: m.value,
        personId: person.id,
      });
    });
  };

  useEffect(() => {
    setRawJson(JSON.stringify(raw, null, 2));
  }, [raw]);

  return (
    <StyledContainer>
      <textarea value={rawJson} onChange={(e) => setRawJson(e.target.value)} />
      <button onClick={update}>Update</button>
    </StyledContainer>
  );
};
