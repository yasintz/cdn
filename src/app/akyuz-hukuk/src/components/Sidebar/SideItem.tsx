import * as React from 'react';
import { PersonType } from '../../types';
import style from './Sidebar.module.scss';
import cx from 'classnames';
import { getPersonUrl } from '../../helper';

type SideItemProps = {
  onClick: () => void;
} & PersonType;

const SideItem: React.FC<SideItemProps> = ({ id, gender, name, onClick }) => {
  const url = React.useMemo(() => getPersonUrl(id, window.location.href), [id]);
  return (
    <a
      href={url}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cx(style.item, {
        [style.female]: gender === 1,
        [style.male]: gender === 0,
      })}
    >
      <span>{name}</span>
    </a>
  );
};

export default SideItem;
