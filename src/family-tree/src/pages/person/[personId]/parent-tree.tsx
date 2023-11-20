import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TreeView, useAppContext } from '../../../app/ctx';
import Tree from '../../../components/Tree';
import {
  getParentTreeByDepth,
  getPersonTreeByDepth,
} from '../../../helper/builder';
import usePerson from '../../../hooks/use-person';
import { PersonType } from '../../../types';

// #region Style
const StyledContainer = styled.div`
  width: calc(100vw - 250px);
  height: 100%;
  overflow: scroll;
`;
// #endregion

const PersonParentTreePage = () => {
  const navigate = useNavigate();
  const { treeDepth, store, treeView } = useAppContext();
  const person = usePerson();

  const setPerson = (p: PersonType) => navigate(`/family-tree/person/${p.id}`);

  const personTree = useMemo(() => {
    if (!person) {
      return;
    }
    return getParentTreeByDepth({
      person,
      depth: treeDepth,
      store,
      showSiblings: false,
    });
  }, [person, store, treeDepth]);

  if (!personTree) {
    return null;
  }

  return (
    <StyledContainer>
      <Tree
        person={personTree}
        onClick={setPerson}
        parentTree={false}
        store={store}
        depth={treeDepth}
        isDTree={treeView === TreeView.DTree}
      />
    </StyledContainer>
  );
};

export default PersonParentTreePage;
