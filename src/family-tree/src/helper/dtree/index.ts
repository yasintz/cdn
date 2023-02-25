import _ from 'lodash';
import { Gender, PersonTreeType, PersonType, StoreType } from '../../types';
import { getCommonChildren, getPersonTreeByDepth } from '../builder';
// @ts-ignore
import dTreeOld from './index.old';

type SimplePersonType = {
  name: string;
  class: 'woman' | 'man';
  extra: {
    person: PersonType;
  };
};

type MarriageType = {
  spouse: SimplePersonType;
  children: DTreePersonType[];
};
type DTreePersonType = SimplePersonType & {
  marriages: MarriageType[];
  children: DTreePersonType[];
};

function personToDtreePerson(person: PersonType): SimplePersonType {
  return {
    name: person.name,
    class: person.gender === 1 ? 'woman' : 'man',
    extra: {
      person,
    },
  };
}

export function personTreeToDTree(
  person: PersonTreeType,
  store: StoreType,
  depth: number
): DTreePersonType {
  const partnersWithChildren = person.partners.map((partner) => ({
    partner,
    children: getCommonChildren(partner, person, store),
  }));

  const marriageChildrenFlatten = _.flatten(
    partnersWithChildren.map((i) => i.children)
  );
  const parentlessChildren = person.children.filter(
    (child) => !marriageChildrenFlatten.some((c) => c.id === child.id)
  );

  const childToDTree = (children: PersonType[]) =>
    depth > 1
      ? children
          .map((c) =>
            getPersonTreeByDepth({
              person: c,
              depth: depth - 1,
              store,
            })
          )
          .map((p) => personTreeToDTree(p, store, depth - 1))
      : [];

  return {
    ...personToDtreePerson(person),
    children: childToDTree(parentlessChildren),
    marriages: partnersWithChildren.map(({ partner, children }) => ({
      spouse: personToDtreePerson(partner),
      children: childToDTree(children),
    })),
  };
}

type OptionsType = {
  target: string;
  callbacks?: {
    nodeClick?: (name: string, extra: SimplePersonType['extra']) => void;
    textRenderer?: (name: string, extra: SimplePersonType['extra']) => string;
    nodeSize?: (
      nodes: any[],
      width: number,
      textRenderer: any
    ) => [number, number];
    nodeRenderer?: (
      name: string,
      x: number,
      y: number,
      height: number,
      width: number,
      extra: SimplePersonType['extra'],
      id: string,
      nodeClass: SimplePersonType['class'],
      textClass: string,
      textRenderer: (
        name: string,
        extra: SimplePersonType['extra'],
        textClass: string
      ) => string
    ) => string;
  };
};
const dTree: {
  init: (persons: DTreePersonType[], options: OptionsType) => void;
} = dTreeOld;

export default dTree;
