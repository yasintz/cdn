import React from 'react';
import { PersonType } from '../../types';
import style from '../app.module.scss';
import RelationFinder from '../RelationDetail';
import RelationTree from '../RelationTree';

type DetailPageProps = {
  person: PersonType;
  setPerson: (p: PersonType) => void;
};

export const DetailPage = ({ person, setPerson }: DetailPageProps) => {
  const [relationView, setRelationView] = React.useState('new');
  const isOldRelation = relationView === 'old';

  return (
    <div className={style.treeContainer}>
      <select
        value={relationView}
        onChange={(e) => setRelationView(e.target.value)}
      >
        <option value="new">New Relation</option>
        <option value="old">Old Relation</option>
      </select>

      {isOldRelation ? (
        <div className={style.relationDetail}>
          <RelationFinder
            mainPerson={person}
            onSelect={setPerson}
            renderAllPerson={false}
          />
        </div>
      ) : (
        <RelationTree mainPerson={person} onSelect={setPerson} />
      )}
    </div>
  );
};
