import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './index.css';
import App from './App.tsx';

const container = document.getElementById('root');
if (!container) throw new Error('The #root element is missing from index.html.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
