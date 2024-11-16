import React from 'react';
import { useParams, NavLink } from 'react-router-dom';
import styled from 'styled-components';
import style from '../app/app.module.scss';
import { useAppContext } from '../app/ctx';
import SettingsPage from '../pages/settings';
import { cn } from '@/lib/utils';

// #region Style
const StyledActionButton = styled(NavLink)`
  color: black;
  text-decoration: none;
  text-align: center;
  & > button {
    width: 100%;
  }
`;

const StyledPersonName = styled.span`
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin: 8px 0;
  border-bottom: 1px solid #ddd;
`;
// #endregion

type PersonLayoutProps = {
  children: React.ReactNode;
};

const PersonLayout = ({ children }: PersonLayoutProps) => {
  const { person: personList, showMobileSidebar } = useAppContext();
  const { personId } = useParams<{ personId: string }>();
  const person = personList.find((p) => p.id === personId);

  const actions = [
    {
      text: 'Detail',
      to: '',
    },
    {
      text: 'Tree',
      to: 'tree',
    },
    {
      text: 'Parent Tree',
      to: 'parent-tree',
    },
    {
      text: 'Relation',
      to: 'add-relation',
    },
    {
      text: 'Update',
      to: 'update',
    },
    {
      text: 'Metadata',
      to: 'metadata',
    },
    {
      text: 'Raw Json',
      to: 'raw-json',
    },
    {
      text: 'Delete',
      to: 'delete',
    },
  ];

  if (!person) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          style.actionSidebar,
          'md:block',
          showMobileSidebar ? 'block' : 'hidden'
        )}
      >
        {person && (
          <>
            <StyledPersonName>{person.name}</StyledPersonName>

            <div>
              {actions.map((n) => (
                <StyledActionButton key={n.text} to={n.to}>
                  <button>{n.text}</button>
                </StyledActionButton>
              ))}
            </div>
          </>
        )}
        <SettingsPage />
      </div>
      {children}
    </>
  );
};

export default PersonLayout;
