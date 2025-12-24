import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
const LazyLogin = lazy(() => import('./pages/auth/Login.jsx'));
const LazyRegister = lazy(() => import('./pages/auth/Register.jsx'));
const LazyLayout = lazy(() => import('./pages/room/Layout.jsx'))
import './App.css'
import PublicRoute from './components/PublicRoute.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContextDefinition.jsx';
import Spinner from './components/Spinner.jsx';

function App() {
  const { isLoggedIn } = useContext(AuthContext)
  return (
    <>
      <BrowserRouter>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
            <Spinner size="xl" color="indigo" />
            <div className="mt-4 text-xl font-semibold text-indigo-400">
              Loading Application...
            </div>
          </div>
        }>
          <Routes>
            {/* Public Routes: Accessible to everyone */}
            <Route path="/login" element={<PublicRoute><LazyLogin /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><LazyRegister /></PublicRoute>} />

            {/* Private Route: Requires authentication */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <LazyLayout />
                </PrivateRoute>
              }
            />

            <Route
              path="/"
              element={<Navigate to={!isLoggedIn ? "/login" : "/rooms"} replace />}
            />

            <Route path="*" element={<div className="p-10 text-xl text-center">404 - Not Found</div>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
