import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ResponsiveProvider } from './contexts/ResponsiveContext.jsx'
// import { store } from './store/store.js';
// import { Provider } from 'react-redux';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ResponsiveProvider>
        <AuthProvider> 
          <App />
        </AuthProvider>
    </ResponsiveProvider>
  </StrictMode>,
)
