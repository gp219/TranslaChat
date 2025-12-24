import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContextDefinition';
import Spinner from './Spinner';

function PrivateRoute({ children }) {
  const { isLoggedIn, isLoading } = useContext(AuthContext); 
  const location = useLocation();

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
            <Spinner size="xl" color="indigo" />
            <div className="mt-4 text-xl font-semibold text-indigo-400">
              Loading Session...
            </div>
        </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default PrivateRoute;