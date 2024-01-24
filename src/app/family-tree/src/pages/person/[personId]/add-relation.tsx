import React from 'react';
import { useParams } from 'react-router-dom';
import AddRelation from '../../../app/AddRelation';
import { useAppContext } from '../../../app/ctx';

const PersonAddRelationPage = () => {
  const { person: personList } = useAppContext();
  const { personId } = useParams<{ personId: string }>();
  const person = personList.find((p) => p.id === personId);

  return <AddRelation person={person} />;
};

export default PersonAddRelationPage;
