import React from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {};

const wrapper = document.createElement('div');
wrapper.classList.add('Portal');
document.body.appendChild(wrapper);

const Portal: React.FC<PortalProps> = ({ children }) =>
  createPortal(children, wrapper);

export default Portal;
