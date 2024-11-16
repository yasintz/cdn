import React, { useMemo, useState } from 'react';
import { PersonType } from '../../types';
import style from './Sidebar.module.scss';
import SideItem from './SideItem';
import { cn } from '@/lib/utils';

type SidebarProps = {
  person: PersonType[];
  onClick: (person: PersonType) => void;
  onCreatePersonClick: () => void;
  onSettingsClick?: () => void;
  className?: string;
};

const Sidebar: React.FC<SidebarProps> = ({
  person,
  onClick,
  onCreatePersonClick,
  onSettingsClick,
  className,
}) => {
  const [search, setSearch] = useState('');
  const persons = useMemo(() => {
    let allPersons = person.map((p, index) => ({ ...p, index }));

    allPersons = allPersons.filter((i) =>
      !search ? true : i.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    );

    return allPersons;
  }, [person, search]);

  return (
    <div className={cn(style.container, className)}>
      <span style={{ fontSize: 12, marginTop: 16 }}>
        {persons.length} Person
      </span>
      <div className={style.createPerson} onClick={onCreatePersonClick}>
        Create Person
      </div>
      <div className={style.createPerson} onClick={onSettingsClick}>
        Settings
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <div className={style.listContainer}>
        {persons.map((p) => (
          <SideItem {...p} onClick={() => onClick(p)} key={p.id} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
