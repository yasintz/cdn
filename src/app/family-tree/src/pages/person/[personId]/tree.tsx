import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppContext } from '../../../app/ctx';
import Tree from '../../../components/Tree';
import { getPersonTreeByDepth } from '../../../helper/builder';
import usePerson from '../../../hooks/use-person';
import { PersonType } from '../../../types';

// #region Style
const StyledContainer = styled.div`
  height: 100%;
  overflow: scroll;
`;
// #endregion

const PersonTreePage = () => {
  const navigate = useNavigate();
  const { treeDepth, store } = useAppContext();
  const person = usePerson();

  const setPerson = (p: PersonType) =>
    navigate(`/cdn/family-tree/person/${p.id}/tree`);

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
      />
    </StyledContainer>
  );
};

export default PersonTreePage;
