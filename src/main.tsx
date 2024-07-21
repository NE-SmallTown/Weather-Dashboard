import React from 'react';
import ReactDOM from 'react-dom/client';
import mainThread from './service_worker/mainThread';
import App from './App.tsx';

import './index.scss';

mainThread();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
