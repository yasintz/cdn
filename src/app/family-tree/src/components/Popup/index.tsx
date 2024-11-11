import React from 'react';
import Portal from '../Portal';
import style from './Popup.module.scss';

type PopupProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Popup = ({ children, open, onClose }: PopupProps) => {
  if (!open) {
    return null;
  }
  return (
    <Portal>
      <div className={style.container}>
        <div className={style.overlay} onClick={onClose} />
        <div className={style.content}>{children}</div>
      </div>
    </Portal>
  );
};

export default Popup;
