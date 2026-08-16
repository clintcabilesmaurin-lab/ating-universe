import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle and suppress benign Vite HMR websocket disconnect rejection in sandbox preview
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || event.reason?.message || '');
    if (reasonStr.includes('WebSocket') || reasonStr.includes('vite') || reasonStr.includes('ws')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (msg.includes('WebSocket') || msg.includes('vite') || msg.includes('ws')) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

