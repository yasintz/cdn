import _ from 'lodash';
import { useState } from 'react';

import { useActions } from './data/useActions';
import { SyncStatusEnum } from '../components/sync';
import { useStore } from './store';

function useData() {
  const { store, setStore } = useStore();
  const [syncStatus] = useState(SyncStatusEnum.Loaded);

  const {
    createPerson,
    createRelation,
    updatePerson,
    createMetadata,
    updateMetadata,
    deletePerson,
    deleteMetadata,
  } = useActions();

  return {
    store,
    person: store.person,
    relation: store.relation,
    metadata: store.metadata,
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
