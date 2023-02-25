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

export function popupHoc<T>(
  Component: React.FC<T>,
  getProps: (props: T) => {
    open: boolean;
    onClose: () => void;
  }
) {
  const Comp = Component as any;
  return (props: T) => (
    <Popup {...getProps(props)}>
      <Comp {...props} />
    </Popup>
  );
}
export default Popup;
