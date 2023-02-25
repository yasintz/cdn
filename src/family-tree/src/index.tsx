import React from 'react';
import ReactDOM from 'react-dom';
import './assets/styles/global.scss';

import App from './app';
import AppV2 from './app.v2';

const isV2 = window.location.pathname.startsWith('/v2/');

ReactDOM.render(
  <React.StrictMode>{isV2 ? <AppV2 /> : <App />}</React.StrictMode>,
  document.getElementById('root')
);

// import './dtree';
