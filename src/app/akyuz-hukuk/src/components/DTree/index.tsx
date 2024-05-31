import ReactDOM from 'react-dom/server';
import { useEffect, useRef } from 'react';
import cx from 'classnames';
import dTree, { personTreeToDTree } from '../../helper/dtree';
import { generateId } from '../../helper/generate-id';
import { PersonTreeType, PersonType, StoreType } from '../../types';
import './style.scss';
import _ from 'lodash';

type DTreeProps = {
  person: PersonTreeType;
  store: StoreType;
  depth: number;
  onClick?: (person: PersonType) => void;
};

const genderClass = ['male', 'female'];
const DTree = ({ person, store, depth, onClick }: DTreeProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    Array.from(ref.current.children).forEach((child) => {
      child.remove();
    });

    const child = document.createElement('div');
    child.id = generateId(5, 'a');

    ref.current.appendChild(child);
    const dtreePerson = personTreeToDTree(person, store, depth);

    dTree.init([dtreePerson], {
      target: `#${child.id}`,
      callbacks: {
        nodeClick: (name, extra) => {
          onClick?.(extra.person);
        },
        nodeRenderer(
          name,
          x,
          y,
          height,
          width,
          extra,
          id,
          nodeClass,
          textClass,
          textRenderer
        ) {
          const element = (
            <div className={cx('person', genderClass[extra.person.gender])}>
              <div>{name}</div>
            </div>
          );

          return ReactDOM.renderToString(element);
        },
      },
    });
  }, [person, person.name, store, depth, onClick]);

  return <div ref={ref} className="dtree-container" />;
};

export default DTree;
