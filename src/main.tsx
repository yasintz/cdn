import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router';

const element = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(element);

root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
