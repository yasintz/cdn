import cx from 'classnames';
import React from 'react';

type ButtonProps = {
  color?: 'default' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export const Button = (props: ButtonProps) => {
  return (
    <button
      className={cx('button', props.color, props.className)}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};
