import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../../app/ctx';
import usePerson from '../../../hooks/use-person';

type PersonDeletePageProps = {};

const PersonDeletePage = (props: PersonDeletePageProps) => {
  const navigate = useNavigate();
  const { deletePerson } = useAppContext();
  const person = usePerson();
  if (!person) {
    return null;
  }

  return (
    <div style={{ padding: 8, textAlign: 'center' }}>
      Do you want to remove <b>{person.name}</b>?
      <div>
        <button onClick={() => navigate('../')}>Cancel</button>
        <button onClick={() => deletePerson(person.id)}>Yes</button>
      </div>
    </div>
  );
};

export default PersonDeletePage;
