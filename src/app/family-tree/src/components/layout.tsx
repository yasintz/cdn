import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../app/ctx';
import useData from '../app/data';
import { PersonType } from '../types';
import Sidebar from './Sidebar';
import style from '../app/app.module.scss';
import Popup from './Popup';
import RelationFinder from '../app/RelationDetail';
import { Sync } from './sync';
import { cn } from '@/lib/utils';
import { MenuIcon } from 'lucide-react';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const data = useData();

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [treeDepth, setTreeDepth] = useState<number>(3);
  const [personSelector, setPersonSelector] = useState<{
    cb?: (v: PersonType) => void;
    person?: PersonType;
  }>();
  const setPerson = (p: PersonType) =>
    navigate(`/cdn/family-tree/person/${p.id}/tree`);

  return (
    <AppContext.Provider
      value={{
        ...data,
        showMobileSidebar,
        setShowMobileSidebar,
        showCreatePersonModal: () => navigate('create-person'),
        showPersonSelector: setPersonSelector,
        treeDepth,
        setTreeDepth,
      }}
    >
      <div className={style.container}>
        <div
          className={cn(
            style.sidebar,
            'md:block',
            showMobileSidebar ? 'block' : 'hidden'
          )}
        >
          <MenuIcon
            className="size-8 border rounded-md p-1 cursor-pointer md:hidden ml-2 select-none"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          />
          <Sidebar
            person={data.person}
            onClick={setPerson}
            onCreatePersonClick={() => navigate('create-person')}
            onSettingsClick={() => navigate('settings')}
          />
        </div>
        <MenuIcon
          className={cn(
            'fixed size-8 border rounded-md p-1 cursor-pointer md:hidden left-2 z-10 select-none',
            showMobileSidebar ? 'hidden' : 'block'
          )}
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        />
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
          />
        </div>
      </Popup>
      <Sync status={data.syncStatus} />
    </AppContext.Provider>
  );
};

export default Layout;
