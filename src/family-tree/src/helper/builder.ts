import { PersonTreeType, PersonType, StoreType } from '../types';
import { IsBuilder } from './is-builder';

const cache: any = {};

export class PersonBuilder {
  person: PersonType;
  constructor(person: PersonType, private readonly store: StoreType) {
    this.person = person;
  }

  private getPersonById = (id: string) =>
    this.store.person.find((i) => i.id === id) as PersonType;

  private _getParents = () => {
    return this.store.relation
      .filter((r) => r.type === 'parent' && r.second === this.person.id)
      .map((r) => this.getPersonById(r.main));
  };

  private _getChildrenByParent = (parentId: string) => {
    return this.store.relation
      .filter((r) => r.type === 'parent' && r.main === parentId)
      .map((i) => this.getPersonById(i.second));
  };

  get metadata() {
    return this.cache('metadata', () =>
      this.store.metadata.filter((m) => m.personId === this.person.id)
    );
  }

  get parents() {
    return this.cache('parents', () => this._getParents());
  }

  get children() {
    return this.cache('children', () =>
      this._getChildrenByParent(this.person.id)
    );
  }

  get partners() {
    return this.cache('partners', () =>
      this.store.relation
        .filter(
          (i) =>
            i.type === 'partner' &&
            (i.main === this.person.id || i.second === this.person.id)
        )
        .map((r) => (r.main === this.person.id ? r.second : r.main))
        .map((i) => this.getPersonById(i))
    );
  }

  get siblings() {
    return this.cache('siblings', () =>
      this._getParents()
        .reduce(
          // eslint-disable-next-line
          (acc, cur) => (acc.push(...this._getChildrenByParent(cur.id)), acc),
          [] as PersonType[]
        )
        .filter((i) => i.id !== this.person.id)
        .reduce(
          (acc, cur) => (
            // eslint-disable-next-line
            acc.findIndex((p) => p.id === cur.id) === -1 && acc.push(cur), acc
          ),
          [] as PersonType[]
        )
    );
  }

  get is() {
    return this.cache('is', () => new IsBuilder(this, this.store));
  }

  private cache<T>(id: string, fn: () => T): T {
    const cacheId = `${this.person.id}_${id}`;
    if (!cache[cacheId]) {
      cache[cacheId] = fn();
    }
    return cache[cacheId];
  }
}

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

function builder(person: PersonType, store: StoreType): PersonBuilder {
  return new PersonBuilder(person, store);
}

export { getPersonTreeByDepth, getParentTreeByDepth };
export default builder;
