import React from 'react';
import CreatePerson from '../app/CreatePerson';
import { useAppContext } from '../app/ctx';

type CreatePersonPageProps = {};

const CreatePersonPage = (props: CreatePersonPageProps) => {
  const { createPerson } = useAppContext();
  return (
    <CreatePerson onSubmit={(name, gender) => createPerson(name, gender)} />
  );
};

export default CreatePersonPage;
