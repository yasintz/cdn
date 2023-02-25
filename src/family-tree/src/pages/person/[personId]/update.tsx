import React from 'react';
import { useParams } from 'react-router-dom';
import CreatePerson from '../../../app/CreatePerson';
import { useAppContext } from '../../../app/ctx';

type PersonUpdatePageProps = {};

const PersonUpdatePage = (props: PersonUpdatePageProps) => {
  const { updatePerson } = useAppContext();
  const { person: personList } = useAppContext();
  const { personId } = useParams<{ personId: string }>();
  const person = personList.find((p) => p.id === personId);

  if (!person) {
    return null;
  }

  return (
    <CreatePerson
      onSubmit={(name, gender) => updatePerson(person.id, { name, gender })}
      name={person?.name}
      gender={person?.gender}
    />
  );
};

export default PersonUpdatePage;
