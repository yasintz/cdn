import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { TreeView, useAppContext } from '../../../app/ctx';
import Tree from '../../../components/Tree';
import { getPersonTreeByDepth } from '../../../helper/builder';
import usePerson from '../../../hooks/use-person';
import { PersonType } from '../../../types';

// #region Style
const StyledContainer = styled.div`
  width: calc(100vw - 250px);
  height: 100%;
  overflow: scroll;
`;
// #endregion

const PersonTreePage = () => {
  const navigate = useNavigate();
  const { treeDepth, store, treeView } = useAppContext();
  const person = usePerson();

  const setPerson = (p: PersonType) => navigate(`/cdn/family-tree/person/${p.id}/tree`);

  const personTree = useMemo(() => {
    if (!person) {
      return;
    }

    return getPersonTreeByDepth({
      person,
      depth: treeDepth,
      store,
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
        store={store}
        depth={treeDepth}
        isDTree={treeView === TreeView.DTree}
      />
    </StyledContainer>
  );
};

export default PersonTreePage;
