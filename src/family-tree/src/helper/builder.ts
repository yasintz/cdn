import { PersonTreeType, PersonType, StoreType } from '../types';

function getPersonTreeByDepth({
  person,
  depth,
  store,
}: {
  person: PersonType;
  depth: number;
  store: StoreType;
}): PersonTreeType {
  const { metadata } = store;
  const buildedPerson = builder(person, store);

  return {
    ...person,
    partners: buildedPerson.partners,
    metadata: metadata.filter((m) => m.personId === person.id),
    children:
      depth > 0
        ? buildedPerson.children.map((c) =>
            getPersonTreeByDepth({
              person: c,
              depth: depth - 1,
              store,
            })
          )
        : [],
  };
}

function getParentTreeByDepth({
  person,
  depth,
  store,
  showSiblings,
}: {
  person: PersonType;
  depth: number;
  store: StoreType;
  showSiblings: boolean;
}): PersonTreeType {
  const buildedPerson = builder(person, store);

  return {
    ...person,
    partners: showSiblings ? buildedPerson.siblings : [],
    metadata: [],
    children:
      depth > 0
        ? buildedPerson.parents.map((c) =>
            getParentTreeByDepth({
              person: c,
              depth: depth - 1,
              store,
              showSiblings,
            })
          )
        : [],
  };
}

export function getCommonChildren(
  person1: PersonType,
  person2: PersonType,
  store: StoreType
) {
  const person1Build = builder(person1, store);
  const person2Build = builder(person2, store);

  return person1Build.children.filter((child) =>
    person2Build.children.some((c2) => c2.id === child.id)
  );
}

function builder(
  person: PersonType,
  { person: personList, relation, metadata }: StoreType
) {
  const getPersonById = (id: string) =>
    personList.find((i) => i.id === id) as PersonType;
  const _getParents = () => {
    return relation
      .filter((r) => r.type === 'parent' && r.second === person.id)
      .map((r) => getPersonById(r.main));
  };

  const _getChildrenByParent = (parentId: string) => {
    return relation
      .filter((r) => r.type === 'parent' && r.main === parentId)
      .map((i) => getPersonById(i.second));
  };

  return {
    metadata: metadata.filter((m) => m.personId === person.id),
    parents: _getParents(),
    children: _getChildrenByParent(person.id),
    partners: relation
      .filter(
        (i) =>
          i.type === 'partner' &&
          (i.main === person.id || i.second === person.id)
      )
      .map((r) => (r.main === person.id ? r.second : r.main))
      .map((i) => getPersonById(i)),

    siblings: _getParents()
      .reduce(
        // eslint-disable-next-line
        (acc, cur) => (acc.push(..._getChildrenByParent(cur.id)), acc),
        [] as PersonType[]
      )
      .filter((i) => i.id !== person.id)
      .reduce(
        (acc, cur) => (
          // eslint-disable-next-line
          acc.findIndex((p) => p.id === cur.id) === -1 && acc.push(cur), acc
        ),
        [] as PersonType[]
      ),
  };
}

export { getPersonTreeByDepth, getParentTreeByDepth };
export default builder;
