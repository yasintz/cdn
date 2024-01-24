import React, { useState } from 'react';
import { PersonTreeType, PersonType, StoreType } from '../../types';
import Person from './Person';
import Portal from '../Portal';
import TreeSizeCalc from './TreeSizeCalc';
import DTree from '../DTree';

type PersonTreeProps = {
  person: PersonTreeType;
  onClick?: (person: PersonType) => void;
  child?: boolean;
  parentTree?: boolean;
};

const PersonTree: React.FC<PersonTreeProps> = ({
  person,
  onClick,
  child,
  parentTree,
}) => {
  const content = (
    <li>
      <div
        className="tree-wrapper"
        style={{
          transform: parentTree ? 'rotate(180deg)' : '',
        }}
      >
        <Person
          id={person.id}
          personName={person.name}
          gender={person.gender}
          onClick={() => onClick?.(person)}
          highlight={person.highlight}
        />
        {person.partners.map((pr) => (
          <Person
            id={pr.id}
            personName={pr.name}
            gender={pr.gender}
            onClick={() => onClick?.(pr)}
            className="inactive-partner"
            key={`${person.id}Partner${pr.id}`}
          />
        ))}
      </div>
      {person.children.length ? (
        <ul>
          {person.children.map((child) => (
            <PersonTree
              person={child}
              onClick={onClick}
              key={`${person.id}Child${child.id}`}
              parentTree={parentTree}
              child
            />
          ))}
        </ul>
      ) : undefined}
    </li>
  );

  if (child) {
    return content;
  }

  return <ul>{content}</ul>;
};

type TreeMainProps = {
  person: PersonTreeType;
  onClick?: (person: PersonType) => void;
  parentTree?: boolean;
};

const TreeMain: React.FC<TreeMainProps> = ({ person, onClick, parentTree }) => {
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const el = (
    <PersonTree person={person} onClick={onClick} parentTree={parentTree} />
  );

  return (
    <>
      <div
        className="tree"
        style={{
          minWidth: size.width,
          minHeight: size.height,
          transform: parentTree ? 'rotate(180deg)' : '',
        }}
      >
        {el}
      </div>
      <Portal>
        <TreeSizeCalc deps={[person]} setSize={setSize}>
          {el}
        </TreeSizeCalc>
      </Portal>
    </>
  );
};

type TreeProps = {
  person: PersonTreeType;
  onClick?: (person: PersonType) => void;
  parentTree?: boolean;
  isDTree: boolean;
  store: StoreType;
  depth: number;
};
const Tree: React.FC<TreeProps> = ({
  person,
  onClick,
  parentTree,
  isDTree,
  store,
  depth,
}) => {
  if (isDTree) {
    return <DTree depth={depth} onClick={onClick} person={person} store={store} />;
  }

  return <TreeMain person={person} onClick={onClick} parentTree={parentTree} />;
};

export default Tree;
