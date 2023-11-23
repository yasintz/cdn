import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import Tree from '../components/Tree';
import { getPersonTreeByDepth, PersonBuilder } from '../helper/builder';
import { PersonTreeType, PersonType, StoreType } from '../types';
import { useAppContext } from './ctx';
import _ from 'lodash';
import style from './RelationDetail/RelationDetail.module.scss';

const StyledRelationTreeContainer = styled.div<{ $inner?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${(props) => (props.$inner ? 'width: calc(100% - 150px);' : '')}
`;

const StyledWrapper = styled.div`
  width: 100%;
  overflow: scroll;
  height: 100%;
`;

type PersonRelationProps = {
  person: PersonType;
  onClick?: (person: PersonType) => void;
};

const PersonRelation: React.FC<PersonRelationProps> = ({ person, onClick }) => {
  const { store, isDTree, treeDepth } = useAppContext();

  const buildedPerson = useMemo(
    () => new PersonBuilder(person, store),
    [person, store]
  );
  const parent = buildedPerson.parents[0];
  const buildedParent = useMemo(
    () => (parent ? new PersonBuilder(parent, store) : undefined),
    [parent, store]
  );

  const personAsChild = useMemo<PersonTreeType>(
    () => ({
      ...person,
      metadata: buildedPerson.metadata,
      highlight: true,
      children: buildedPerson.children.map((child) => ({
        ...getPersonTreeByDepth({ person: child, store, depth: 0 }),
        children: [],
        partners: [],
      })),
      partners: buildedPerson.partners,
    }),
    [
      buildedPerson.children,
      buildedPerson.metadata,
      buildedPerson.partners,
      person,
      store,
    ]
  );
  const tree = useMemo<PersonTreeType>(
    () => ({
      ...(parent || person),
      metadata: buildedParent?.metadata || buildedPerson.metadata,
      highlight: !parent,
      partners: parent
        ? buildedPerson.parents.filter((p) => p.id !== parent.id)
        : buildedPerson.partners,

      children: _.sortBy(
        [
          ...(parent ? buildedPerson.siblings : buildedPerson.children).map(
            (c) => ({
              ...getPersonTreeByDepth({ person: c, depth: 0, store }),
              children: [],
              partners: [],
            })
          ),
          ...(parent ? [personAsChild] : []),
        ],
        'name'
      ),
    }),
    [
      buildedParent?.metadata,
      buildedPerson.children,
      buildedPerson.metadata,
      buildedPerson.parents,
      buildedPerson.partners,
      buildedPerson.siblings,
      parent,
      person,
      personAsChild,
      store,
    ]
  );

  return (
    <Tree
      depth={treeDepth}
      person={tree}
      onClick={onClick}
      store={store}
      isDTree={isDTree}
    />
  );
};

type RelationTreeProps = {
  mainPerson: PersonType;
  onSelect: (person: PersonType) => void;
  inner?: boolean;
};

const RelationTree: React.FC<RelationTreeProps> = ({
  mainPerson,
  onSelect,
  inner,
}) => {
  const [stack, setStack] = useState<PersonType[]>([mainPerson]);
  const stackRef = useRef<HTMLDivElement>(null);

  const lastPerson = stack[stack.length - 1] as undefined | PersonType;

  const renderPerson = inner ? mainPerson : lastPerson;

  const handleClick = (person: PersonType) => {
    if (inner) {
      onSelect(person);
      return;
    }
    setStack((prev) => [...prev.filter((i) => i.id !== person.id), person]);
    onSelect(person);
    setTimeout(() => {
      if (stackRef.current) {
        stackRef.current.scrollTo({
          left: stackRef.current.scrollWidth + 10,
          behavior: 'smooth',
        });
      }
    });
  };

  useEffect(() => {
    if (lastPerson?.id !== mainPerson.id) {
      setStack([mainPerson]);
    }
  }, [lastPerson, mainPerson]);

  return (
    <StyledRelationTreeContainer $inner={inner}>
      {!inner && (
        <div className={style.stackList} ref={stackRef}>
          {stack.map((p, index) => (
            <div onClick={() => handleClick(p)} key={p.id + 'stack'}>
              {p.name}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setStack((prev) => {
                    const copy = Array.from(prev);
                    copy.splice(index, 1);
                    return copy;
                  });

                  onSelect(stack[stack.length - 2]);
                }}
              >
                x
              </span>
            </div>
          ))}
        </div>
      )}

      {renderPerson && (
        <StyledWrapper>
          <PersonRelation person={renderPerson} onClick={handleClick} />
        </StyledWrapper>
      )}
    </StyledRelationTreeContainer>
  );
};

export default RelationTree;
