import { RawJsonPopup } from '../../../app/RawJsonPopup';
import usePerson from '../../../hooks/use-person';

type PersonRawJsonPageProps = {};

const PersonRawJsonPage = (props: PersonRawJsonPageProps) => {
  const person = usePerson();
  if (!person) {
    return null;
  }

  return <RawJsonPopup person={person} />;
};

export default PersonRawJsonPage;
