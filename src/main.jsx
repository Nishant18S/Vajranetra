import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import './index.css';
import './theme/public.css';
import './theme/admin.css';

import { AuthProvider } from './context/AuthContext.jsx';
import { SystemProvider } from './context/SystemContext.jsx';
import { ForecastProvider } from './context/ForecastContext.jsx';
import { AlertProvider } from './context/AlertContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <SystemProvider>
          <ForecastProvider>
            <AlertProvider>
              <App />
            </AlertProvider>
          </ForecastProvider>
        </SystemProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);