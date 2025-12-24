import { useContext } from "react";
import { Navigate } from "react-router-dom"
import { AuthContext } from "../contexts/AuthContextDefinition";
import Spinner from "./Spinner";

function PublicRoute({children}) {
 const { isLoggedIn, isLoading } = useContext(AuthContext);

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
  
  if (isLoggedIn) {
    return <Navigate to="/" replace />; 
  }
  return children;
}
export default PublicRoute