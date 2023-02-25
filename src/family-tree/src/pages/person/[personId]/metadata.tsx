import { MetadataPopup } from '../../../app/MetadataPopup';
import usePerson from '../../../hooks/use-person';

type PersonMetadataPageProps = {};

const PersonMetadataPage = (props: PersonMetadataPageProps) => {
  const person = usePerson();

  if (!person) {
    return null;
  }

  return <MetadataPopup person={person} />;
};

export default PersonMetadataPage;
