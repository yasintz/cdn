import React from 'react';
import {
  Gender,
  MetadataType,
  PersonType,
  RelationType,
  RelationValueType,
  StoreType,
} from '../../types';
import turkishToEnglish from '../../helper/tr-to-eng';
import { useStore } from '../store';

const uid = () => Math.random().toString(36).substring(2, 12);

type State<S> = readonly [S, (value: S) => void];

type Params = {
  personState: State<PersonType[]>;
  relationState: State<RelationType[]>;
  metadataState: State<MetadataType[]>;
};

function usePersonActions(params: Params) {
  const {
    personState: [personList, setPerson],
    relationState: [relation, setRelation],
    metadataState: [metadata, setMetadata],
  } = params;

  const createPerson = (name: string, gender: Gender) => {
    const newPerson = {
      name,
      gender,
      id: personList.length.toString(),
    };

    setPerson([newPerson, ...personList]);

    return newPerson;
  };

  const updatePerson = (
    id: string,
    newPerson: Partial<Omit<PersonType, 'id'>>
  ) => {
    const prs = personList.findIndex((p) => p.id === id);

    if (prs === -1) {
      return;
    }

    const prevPerson = personList[prs];
    const newItem = {
      ...prevPerson,
      ...newPerson,
      id,
    };

    const arrayCopy = Array.from(personList);
    arrayCopy[prs] = newItem;

    setPerson(arrayCopy);
  };

  const deletePerson = (id: string) => {
    const doubleCheck = window.confirm('Are you sure?');
    if (doubleCheck) {
      setMetadata(metadata.filter((m) => m.personId !== id));
      setRelation(relation.filter((r) => r.main !== id && r.second !== id));
      setPerson(personList.filter((p) => p.id !== id));
    }
  };

  return { createPerson, updatePerson, deletePerson };
}

function useRelationActions(params: Params) {
  const {
    relationState: [relations, setRelation],
    personState: [personList, setPerson],
    metadataState: [metadataList, setMetadata],
  } = params;

  type RelationParam = {
    type: RelationValueType;
    main: string;
    second: string;
  };

  const handleRelation = ({ main, second, type }: RelationParam) => {
    const d: RelationType = {
      type: type as any,
      main,
      second,
      id: '',
    };

    const mapp: Record<RelationValueType, RelationType> = {
      children: {
        type: 'parent',
        main: second,
        id: '',
        second: main,
      },
      parent: d,
      partner: d,
      merge: d, // this won't work because code will change old user to new user id
    };

    const newRelation = mapp[type];
    newRelation.id = relations.length.toString();
    return newRelation;
  };

  const createRelation = (...args: Array<RelationParam>) => {
    const mergeAction = args.filter((a) => a.type === 'merge')[0];

    if (mergeAction) {
      if (args.length > 1) {
        alert('You cannot do anything else while merging.');
        return;
      }

      const { main, second } = mergeAction;

      const mainUser = personList.find((p) => p.id === main);
      const secondUser = personList.find((p) => p.id === second);

      if (!mainUser || !secondUser) {
        alert(`${main} or ${second} user not found`);
        return;
      }

      if (mainUser.gender !== secondUser.gender) {
        alert(`You can't merge different gender`);
        return;
      }

      setRelation(
        relations.map((r) =>
          r.main === second
            ? { ...r, main: main }
            : r.second === second
            ? { ...r, second: main }
            : r
        )
      );

      setMetadata(
        metadataList.map((m) =>
          m.personId === second ? { ...m, personId: main } : m
        )
      );
      setPerson(personList.filter((u) => u.id !== second));

      return;
    }

    setRelation([
      ...relations,
      ...args
        .filter((i) => i.main !== i.second)
        .map(handleRelation)
        .filter((rel) => relations.findIndex((a) => a.id === rel.id) === -1),
    ]);
  };

  return { createRelation };
}

function useMetadataActions(params: Params) {
  const {
    metadataState: [metadataList, setMetadata],
  } = params;

  const createMetadata = (metadata: Omit<MetadataType, 'id'>): MetadataType => {
    const newMetadata: MetadataType = {
      id: `${turkishToEnglish(metadata.key.split(' ').join(''))}_${uid()}`,
      ...metadata,
    };

    setMetadata([newMetadata, ...metadataList]);

    return newMetadata;
  };

  const updateMetadata = (
    id: string,
    newMetadata: Partial<Omit<MetadataType, 'id'>>
  ) => {
    const prs = metadataList.findIndex((p) => p.id === id);

    if (prs === -1) {
      return;
    }

    const prevMetadata = metadataList[prs];
    const newItem = {
      ...prevMetadata,
      ...newMetadata,
      id,
    };

    const arrayCopy = Array.from(metadataList);
    arrayCopy[prs] = newItem;

    setMetadata(arrayCopy);
  };
  const deleteMetadata = (id: string) => {
    setMetadata(metadataList.filter((i) => i.id !== id));
  };

  return { createMetadata, updateMetadata, deleteMetadata };
}

export function useActions() {
  const { store, setStore } = useStore();
  const personState = [
    store.person,
    (person: StoreType['person']) => setStore({ ...store, person }),
  ] as const;
  const relationState = [
    store.relation,
    (relation: StoreType['relation']) => setStore({ ...store, relation }),
  ] as const;
  const metadataState = [
    store.metadata,
    (metadata: StoreType['metadata']) => setStore({ ...store, metadata }),
  ] as const;

  const params = {
    personState,
    relationState,
    metadataState,
  };

  const { createPerson, updatePerson, deletePerson } = usePersonActions(params);
  const { createRelation } = useRelationActions(params);
  const { createMetadata, updateMetadata, deleteMetadata } =
    useMetadataActions(params);

  return {
    createPerson,
    updatePerson,
    createRelation,
    createMetadata,
    deleteMetadata,
    updateMetadata,
    deletePerson,
  };
}
