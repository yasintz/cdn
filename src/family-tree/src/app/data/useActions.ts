import React from 'react';
import {
  Gender,
  MetadataType,
  PersonType,
  RelationType,
  RelationValueType,
} from '../../types';
import turkishToEnglish from '../../helper/tr-to-eng';

const uid = () => Math.random().toString(36).substring(2, 12);

type State<S> = [S, React.Dispatch<React.SetStateAction<S>>];

type Params = {
  personState: State<PersonType[]>;
  relationState: State<RelationType[]>;
  metadataState: State<MetadataType[]>;
};

function usePersonActions(params: Params) {
  const {
    personState: [personList, setPerson],
    relationState: [, setRelation],
    metadataState: [, setMetadata],
  } = params;

  const createPerson = (name: string, gender: Gender) => {
    const newPerson = {
      name,
      gender,
      id: personList.length.toString(),
    };

    setPerson((prev) => [newPerson, ...prev]);

    return newPerson;
  };

  const updatePerson = (
    id: string,
    newPerson: Partial<Omit<PersonType, 'id'>>
  ) =>
    setPerson((prev) => {
      const prs = prev.findIndex((p) => p.id === id);

      if (prs === -1) {
        return prev;
      }

      const prevPerson = prev[prs];
      const newItem = {
        ...prevPerson,
        ...newPerson,
        id,
      };

      const arrayCopy = Array.from(prev);
      arrayCopy[prs] = newItem;

      return arrayCopy;
    });

  const deletePerson = (id: string) => {
    const doubleCheck = window.confirm('Are you sure?');
    if (doubleCheck) {
      setMetadata((prev) => prev.filter((m) => m.personId !== id));
      setRelation((prev) =>
        prev.filter((r) => r.main !== id && r.second !== id)
      );
      setPerson((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return { createPerson, updatePerson, deletePerson };
}

function useRelationActions(params: Params) {
  const {
    relationState: [relations, setRelation],
    personState: [personList, setPerson],
    metadataState: [, setMetadata],
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

      setRelation((prev) =>
        prev.map((r) =>
          r.main === second
            ? { ...r, main: main }
            : r.second === second
            ? { ...r, second: main }
            : r
        )
      );

      setMetadata((prev) =>
        prev.map((m) => (m.personId === second ? { ...m, personId: main } : m))
      );
      setPerson((prev) => prev.filter((u) => u.id !== second));

      return;
    }

    setRelation((prev) => [
      ...prev,
      ...args
        .filter((i) => i.main !== i.second)
        .map(handleRelation)
        .filter((rel) => prev.findIndex((a) => a.id === rel.id) === -1),
    ]);
  };

  return { createRelation };
}

function useMetadataActions(params: Params) {
  const {
    metadataState: [, setMetadata],
  } = params;

  const createMetadata = (metadata: Omit<MetadataType, 'id'>): MetadataType => {
    const newMetadata: MetadataType = {
      id: `${turkishToEnglish(metadata.key.split(' ').join(''))}_${uid()}`,
      ...metadata,
    };

    setMetadata((prev) => [newMetadata, ...prev]);

    return newMetadata;
  };

  const updateMetadata = (
    id: string,
    newMetadata: Partial<Omit<MetadataType, 'id'>>
  ) =>
    setMetadata((prev) => {
      const prs = prev.findIndex((p) => p.id === id);

      if (prs === -1) {
        return prev;
      }

      const prevMetadata = prev[prs];
      const newItem = {
        ...prevMetadata,
        ...newMetadata,
        id,
      };

      const arrayCopy = Array.from(prev);
      arrayCopy[prs] = newItem;

      return arrayCopy;
    });
  const deleteMetadata = (id: string) => {
    setMetadata((prev) => prev.filter((i) => i.id !== id));
  };

  return { createMetadata, updateMetadata, deleteMetadata };
}

export function useActions(params: Params) {
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
