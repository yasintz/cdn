import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext, TreeView } from '../app/ctx';
import useData from '../app/data';
import { usePersonIdStateFromUrl } from '../hooks/use-person-id-state-from-url';
import { PersonType } from '../types';
import Sidebar from './Sidebar';
import style from '../app/app.module.scss';
import Popup from './Popup';
import RelationFinder from '../app/RelationDetail';
import { Sync } from './sync';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const data = useData();

  const [treeView, setTreeView] = useState<TreeView>(TreeView.Default);
  const [treeDepth, setTreeDepth] = useState<number>(3);
  const [personSelector, setPersonSelector] = useState<{
    cb?: (v: PersonType) => void;
    person?: PersonType;
  }>();
  const setPerson = (p: PersonType) => navigate(`/family-tree/person/${p.id}`);

  return (
    <AppContext.Provider
      value={{
        ...data,
        showCreatePersonModal: () => navigate('/family-tree/create-person'),
        showPersonSelector: setPersonSelector,
        treeDepth,
        isDTree: treeView === TreeView.DTree,
        treeView,
        setTreeView,
        setTreeDepth,
      }}
    >
      <div className={style.container}>
        <div className={style.sidebar}>
          <Sidebar
            person={data.person}
            onClick={setPerson}
            onCreatePersonClick={() => navigate('/family-tree/create-person')}
            onSettingsClick={() => navigate('/family-tree/settings')}
          />
        </div>
        {children}
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
            isOldRelation={treeView === TreeView.List}
          />
        </div>
      </Popup>
      <Sync status={data.syncStatus} />
    </AppContext.Provider>
  );
};

export default Layout;
