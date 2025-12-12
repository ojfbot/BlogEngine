import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@carbon/styles/css/styles.css';
import './index.scss';

// Set initial theme
document.documentElement.setAttribute('data-carbon-theme', 'g100');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
