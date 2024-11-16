import React, { useEffect, useMemo, useRef, useState } from 'react';
import style from './RelationDetail.module.scss';
import { PersonType } from '../../types';
import cx from 'classnames';
import { PersonBuilder } from '../../helper/builder';
import { useAppContext } from '../ctx';
import RelationTree from '../RelationTree';
import _ from 'lodash';

type RelationFinderProps = {
  mainPerson?: PersonType;
  onSelect?: (person: PersonType) => void;
  renderAllPerson: boolean;
};

const RenderPersonList: React.FC<{
  personList: PersonType[];
  title: string;
  onClick: (person: PersonType) => void;
}> = ({ personList, title, onClick }) => {
  if (personList.length === 0) {
    return null;
  }
  return (
    <div className={style.personList}>
      <h3>{title}</h3>
      <div>
        {personList.map((person) => (
          <div onClick={() => onClick(person)} key={person.id + title}>
            {person.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const PersonRelation = ({
  person,
  onClick,
  renderAllPerson,
  isOldRelation,
}: {
  person?: PersonType;
  onClick: (person: PersonType) => void;
  renderAllPerson: boolean;
  isOldRelation?: boolean;
}) => {
  const [search, setSearch] = useState('');
  const { store, person: personList } = useAppContext();
  const builded = useMemo(
    () => (person ? new PersonBuilder(person, store) : null),
    [person, store]
  );

  return (
    <div className={style.listContainer}>
      {renderAllPerson && (
        <div className={style.allPerson}>
          <div>
            <input value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <RenderPersonList
            personList={personList.filter((i) =>
              !search
                ? true
                : i.name.toLowerCase().indexOf(search.toLowerCase()) > -1
            )}
            title="All Persons"
            onClick={onClick}
          />
        </div>
      )}
      {builded && isOldRelation && (
        <>
          <RenderPersonList
            personList={builded.children}
            title="Children"
            onClick={onClick}
          />
          <RenderPersonList
            personList={builded.parents}
            title="Parents"
            onClick={onClick}
          />
          <RenderPersonList
            personList={builded.siblings}
            title="Sibling"
            onClick={onClick}
          />
          <RenderPersonList
            personList={builded.partners}
            title="Partner"
            onClick={onClick}
          />
        </>
      )}
      {person && !isOldRelation && (
        <RelationTree mainPerson={person} onSelect={onClick} inner />
      )}
    </div>
  );
};

const RelationFinder: React.FC<RelationFinderProps> = ({
  mainPerson,
  onSelect,
  renderAllPerson,
}) => {
  const [relationView, setRelationView] = useState('new');
  const isOldRelation = relationView === 'old';
  const [stack, setStack] = useState<PersonType[]>([]);
  const stackRef = useRef<HTMLDivElement>(null);
  const lastPerson = stack[stack.length - 1];
  const handleClick = (person: PersonType) => {
    setStack((prev) => [...prev.filter((i) => i.id !== person.id), person]);
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
    if (lastPerson && onSelect) {
      onSelect(lastPerson);
    }
  }, [onSelect, lastPerson]);

  return (
    <div className={cx(style.relationFinder)}>
      <div className={style.stackList} ref={stackRef as any}>
        <select
          value={relationView}
          onChange={(e) => setRelationView(e.target.value)}
        >
          <option value="new">New Relation</option>
          <option value="old">Old Relation</option>
        </select>
        {mainPerson && <span>{mainPerson.name}</span>}

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
              }}
            >
              x
            </span>
          </div>
        ))}
      </div>

      <PersonRelation
        renderAllPerson={renderAllPerson}
        onClick={handleClick}
        person={lastPerson || mainPerson}
        isOldRelation={isOldRelation}
      />
    </div>
  );
};

export default RelationFinder;
