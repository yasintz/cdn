import React, { useMemo, useState } from 'react';
import Popup from '../components/Popup';
import Sidebar from '../components/Sidebar';
import Tree from '../components/Tree';
import { PersonType } from '../types';
import AddRelation from './AddRelation/index';
import RelationFinder from './RelationDetail';
import style from './app.module.scss';
import { AppContext, TreeView } from './ctx';
import useData from './data';
import builder, {
  getPersonTreeByDepth,
  getParentTreeByDepth,
} from '../helper/builder';
import styled from 'styled-components';
import { usePersonIdStateFromUrl } from '../hooks/use-person-id-state-from-url';
import { MetadataPopup } from './MetadataPopup';
import { Sync } from '../components/sync';
import { RawJsonPopup } from './RawJsonPopup';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import { DetailPage } from './pages/detail';
import CreatePerson from './CreatePerson';

const StyledTreeContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledDepthInputContainer = styled.label`
  margin: 12px;
`;

const StyledActionButton = styled.button<{ $highlight?: boolean }>`
  ${(props) =>
    props.$highlight &&
    `
      box-shadow: inset 0 0 0 1px black;
      border-color: black;
    `}
`;

enum PageMode {
  Tree,
  Detail,
  ParentTree,
  Nothing,
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [personId, setPersonId] = usePersonIdStateFromUrl();
  const [mode, setMode] = useState<PageMode>(PageMode.Tree);

  const [isOldRelation, setIsOldRelation] = useState(false);
  const [isDTree, setIsDTree] = useState(false);
  const [treeDepth, setTreeDepth] = useState<number>(3);

  const [showSiblingsInParentTree, setShowSiblingsInParentTree] =
    useState(false);

  const [showParentlessNodes, setShowParentlessNodes] = useState(false);

  const data = useData();

  const {
    store,
    person: personList,
    createPerson,
    updatePerson,
    deletePerson,
    syncStatus,
  } = data;

  const person = useMemo(
    () => (personId ? personList.find((p) => p.id === personId) : undefined),
    [personId, personList]
  );
  const setPerson = (p: PersonType) => setPersonId(p.id);

  const [personSelector, setPersonSelector] = useState<{
    cb?: (v: PersonType) => void;
    person?: PersonType;
  }>();

  const personTree = useMemo(() => {
    if (!person) {
      return null;
    }

    if (mode === PageMode.ParentTree) {
      return getParentTreeByDepth({
        person,
        depth: treeDepth,
        store,
        showSiblings: showSiblingsInParentTree,
      });
    }

    if (mode === PageMode.Tree) {
      return getPersonTreeByDepth({
        person,
        depth: treeDepth,
        store,
      });
    }
    return null;
  }, [mode, person, store, treeDepth, showSiblingsInParentTree]);

  const parentlessNodes = useMemo(
    () =>
      personList.filter((person) => {
        const main = builder(person, store);

        const partnersHasNoParent = main.partners
          .map((i) => builder(i, store).parents.length === 0)
          .every((i) => i);

        return main.parents.length === 0 && partnersHasNoParent;
      }),
    [personList, store]
  );

  const actions = [
    {
      text: 'Tree',
      handler: () => setMode(PageMode.Tree),
      highlight: mode === PageMode.Tree,
      hide: true,
    },
    {
      text: `DTree: ${isDTree ? 'on' : 'off'}`,
      handler: () => setIsDTree((prev) => !prev),
      hide: true,
    },
    {
      text: 'Detail',
      to: `detail`,
      highlight: mode === PageMode.Detail,
      hide: true,
    },
    {
      text: 'Parent Tree',
      handler: () => setMode(PageMode.ParentTree),
      highlight: mode === PageMode.ParentTree,
      hide: true,
    },
    {
      text: 'Relation',
      to: 'add-relation',
      hide: true,
    },
    {
      text: 'Edit',
      to: 'edit',
      hide: true,
    },
    {
      text: 'Metadata',
      to: 'metadata',
      hide: true,
    },
    {
      text: `Old Relation Mode: ${isOldRelation ? 'on' : 'off'}`,
      handler: () => setIsOldRelation((prev) => !prev),
      hide: true,
    },
    {
      text: `Parentless: ${showParentlessNodes ? 'on' : 'off'}`,
      handler: () => setShowParentlessNodes((prev) => !prev),
    },
    {
      text: `Delete`,
      handler: () => person && deletePerson(person.id),
      hide: true,
    },
    {
      text: 'Raw Json',
      to: 'raw-json',
      hide: true,
    },
  ]
    .map((i) => ({
      ...i,
      handler: () => {
        if (i.to) {
          navigate(`/${person?.id}/${i.to}?user=${person?.id}`);
          setMode(PageMode.Nothing);
        } else if (i.text === 'Parent Tree' || i.text === 'Tree') {
          navigate(`/?user=${person?.id}`);
        }
        i.handler?.();
      },
    }))
    .filter((i) => !i.hide);

  return (
    <AppContext.Provider
      value={{
        ...data,
        showCreatePersonModal: () => navigate('/create-person'),
        showPersonSelector: setPersonSelector,
        treeDepth,
        isDTree,
        treeView: TreeView.Default,
        setTreeView: () => 0,
        setTreeDepth,
      }}
    >
      <div className={style.container}>
        <div className={style.sidebar}>
          <Sidebar
            person={personList}
            onClick={setPerson}
            onCreatePersonClick={() => navigate('/create-person')}
          />
        </div>
        <div className={style.actionSidebar}>
          {person && (
            <>
              <h5>{person.name}</h5>

              <div>
                {actions.map((n) => (
                  <StyledActionButton
                    onClick={n.handler}
                    key={n.text}
                    $highlight={n.highlight}
                  >
                    {n.text}
                  </StyledActionButton>
                ))}
              </div>
            </>
          )}
        </div>
        {showParentlessNodes && (
          <div className={style.parentless}>
            <div>
              {parentlessNodes.map((node) => (
                <div
                  key={`parentless_${node.id}`}
                  onClick={() => setPerson(node)}
                  className={node.gender ? style.woman : style.man}
                >
                  {node.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {person && mode === PageMode.Detail && (
          <DetailPage {...{ isOldRelation, person, setPerson }} />
        )}

        {personTree && [PageMode.Tree, PageMode.ParentTree].includes(mode) && (
          <StyledTreeContainer>
            <StyledDepthInputContainer>
              <label>
                Depth:
                <input
                  type="number"
                  value={treeDepth.toString()}
                  onChange={(e) => setTreeDepth(parseInt(e.target.value))}
                />
              </label>
              {mode === PageMode.ParentTree && (
                <label style={{ marginLeft: 8 }}>
                  <input
                    type="checkbox"
                    checked={showSiblingsInParentTree}
                    onChange={() =>
                      setShowSiblingsInParentTree((prev) => !prev)
                    }
                  />
                  Show Siblings
                </label>
              )}
            </StyledDepthInputContainer>

            <div className={style.treeContainer}>
              <Tree
                person={personTree}
                onClick={setPerson}
                parentTree={mode === PageMode.ParentTree}
                store={store}
                isDTree={isDTree}
                depth={treeDepth}
              />
            </div>
          </StyledTreeContainer>
        )}

        <Routes>
          {person && (
            <Route path="/:person">
              <Route index element={<Navigate to="detail" />} />
              <Route
                path="detail"
                element={
                  <DetailPage {...{ isOldRelation, person, setPerson }} />
                }
              />
              <Route
                path="metadata"
                element={<MetadataPopup person={person} />}
              />
              <Route
                path="edit"
                element={
                  <CreatePerson
                    onSubmit={(name, gender) =>
                      updatePerson(person.id, { name, gender })
                    }
                    name={person?.name}
                    gender={person?.gender}
                  />
                }
              />
              <Route
                path="raw-json"
                element={<RawJsonPopup person={person} />}
              />
              <Route
                path="add-relation"
                element={<AddRelation person={person} />}
              />
            </Route>
          )}
          <Route
            path="create-person"
            element={
              <CreatePerson
                onSubmit={(name, gender) => createPerson(name, gender)}
              />
            }
          />
        </Routes>
      </div>

      <Popup
        open={!!personSelector}
        onClose={() => setPersonSelector(undefined)}
      >
        <div style={{ width: 900, height: 400 }}>
          <RelationFinder
            mainPerson={personSelector?.person}
            onSelect={personSelector?.cb}
            renderAllPerson
            isOldRelation={isOldRelation}
          />
        </div>
      </Popup>
      <Sync status={syncStatus} />
    </AppContext.Provider>
  );
};

export default App;
