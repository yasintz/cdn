import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TreeView, useAppContext } from '../../../app/ctx';
import { DetailPage } from '../../../app/pages/detail';
import { PersonType } from '../../../types';

const PersonHomePage = () => {
  const navigate = useNavigate();
  const { person: personList, treeView } = useAppContext();
  const { personId } = useParams<{ personId: string }>();
  const person = personList.find((p) => p.id === personId);

  const setPerson = (p: PersonType) => navigate(`/family-tree/person/${p.id}`);

  if (!person) {
    return null;
  }

  return (
    <DetailPage
      person={person}
      setPerson={setPerson}
      isOldRelation={treeView === TreeView.List}
    />
  );
};

export default PersonHomePage;
