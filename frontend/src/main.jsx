import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- Added this import
import App from './App.jsx'

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