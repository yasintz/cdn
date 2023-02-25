import { PersonType } from '../../types';
import style from '../app.module.scss';
import RelationFinder from '../RelationDetail';
import RelationTree from '../RelationTree';

type DetailPageProps = {
  isOldRelation: boolean;
  person: PersonType;
  setPerson: (p: PersonType) => void;
};

export const DetailPage = ({
  isOldRelation,
  person,
  setPerson,
}: DetailPageProps) => {
  return (
    <div className={style.treeContainer}>
      {isOldRelation ? (
        <div className={style.relationDetail}>
          <RelationFinder
            mainPerson={person}
            onSelect={setPerson}
            renderAllPerson={false}
            isOldRelation
          />
        </div>
      ) : (
        <RelationTree mainPerson={person} onSelect={setPerson} />
      )}
    </div>
  );
};
