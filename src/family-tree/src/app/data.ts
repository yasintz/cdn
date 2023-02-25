import uniqBy from 'lodash/uniqBy';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { MetadataType, PersonType, RelationType, StoreType } from '../types';
import throttle from 'lodash/throttle';

import { useActions } from './data/useActions';
import { SyncStatusEnum } from '../components/sync';

const params = new URLSearchParams(window.location.search);
const url = params.get('api') || 'https://api.npoint.io/ae8995c6924d92c556f8';

const db = {
  get: () => fetch(url).then((i) => i.json() as Promise<StoreType>),
  set: throttle(
    (store: StoreType) => axios.post(url, store).then((res) => res.data),
    1000
  ),
};

const getPromise = db.get();

let isFetched = false;
function useData() {
  const personState = useState<PersonType[]>([]);
  const relationState = useState<RelationType[]>([]);
  const metadataState = useState<MetadataType[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatusEnum>(
    SyncStatusEnum.Loaded
  );

  const {
    createPerson,
    createRelation,
    updatePerson,
    createMetadata,
    updateMetadata,
    deletePerson,
    deleteMetadata,
  } = useActions({
    personState,
    relationState,
    metadataState,
  });
  // const [store, setStore]= useState<StoreType>({
  //   person:[],
  //   metadata: [],
  //   relation: []
  // })

  const [person, setPerson] = personState;
  const [relation, setRelation] = relationState;
  const [metadata, setMetadata] = metadataState;
  const store: StoreType = useMemo(
    () => ({
      person,
      relation,
      metadata,
    }),
    [metadata, person, relation]
  );

  useEffect(() => {
    getPromise.then((store) => {
      setPerson(store.person);
      setRelation(uniqBy(store.relation, (r) => r.type + r.main + r.second));
      setMetadata(store.metadata);
      setTimeout(() => {
        isFetched = true;
      }, 1000);
    });
  }, [setMetadata, setPerson, setRelation]);

  useEffect(() => {
    if (!isFetched) {
      return;
    }

    setSyncStatus(SyncStatusEnum.Loading);
    db.set(store)
      ?.then(() => setSyncStatus(SyncStatusEnum.Loaded))
      .catch((error) => {
        console.log({ error });
        setSyncStatus(SyncStatusEnum.Failed);
      });
  }, [store]);

  return {
    store,
    person,
    relation,
    metadata,
    createPerson,
    createRelation,
    updatePerson,
    createMetadata,
    updateMetadata,
    deletePerson,
    syncStatus,
    deleteMetadata,
  };
}

export default useData;
