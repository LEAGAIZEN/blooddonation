import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Added this import
import App from './App.jsx'
import axios from 'axios'

// Global API Routing configuration for production (Render backend)
if (import.meta.env.PROD) {
  const BACKEND_URL = 'https://blooddonation-8epp.onrender.com';
  
  // Configure default baseURL for all raw Axios instances
  axios.defaults.baseURL = BACKEND_URL;
  
  // Override native window.fetch to automatically route relative API calls to Render
  const originalFetch = window.fetch;
  window.fetch = function (url, options) {
    if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('/assets') && !url.startsWith('/vite')) {
      return originalFetch(BACKEND_URL + url, options);
    }
    return originalFetch(url, options);
  };
}

// CSS Imports
import './index.css'
import './styles/admin-global.css';
import './styles/admin.css';
import './styles/admincamp.css';
import './styles/adminstock.css';
import './styles/user-record.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>  {/* <-- Wrapped App in BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)