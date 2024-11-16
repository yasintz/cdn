import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../../app/ctx';
import { DetailPage } from '../../../app/pages/detail';
import { PersonType } from '../../../types';

const PersonHomePage = () => {
  const navigate = useNavigate();
  const { person: personList } = useAppContext();
  const { personId } = useParams<{ personId: string }>();
  const person = personList.find((p) => p.id === personId);

  const setPerson = (p: PersonType) =>
    navigate(`/cdn/family-tree/person/${p.id}/tree`);

  if (!person) {
    return null;
  }

  return <DetailPage person={person} setPerson={setPerson} />;
};

export default PersonHomePage;
