import React from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  children: React.ReactNode;
};

const wrapper = document.createElement('div');
wrapper.classList.add('Portal');
document.body.appendChild(wrapper);

const Portal = ({ children }: PortalProps) => createPortal(children, wrapper);

export default Portal;
