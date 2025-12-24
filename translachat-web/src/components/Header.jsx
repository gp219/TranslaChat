import { useNavigate } from "react-router-dom";
import { LogOut, MessageSquare, Menu } from 'lucide-react';
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextDefinition";
import { useResponsive } from "../contexts/ResponsiveContext";

const Header = ({ username, toggleSidebar }) => {
    const { isMobile } = useResponsive();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext)

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="flex justify-between items-center p-4 bg-gray-900 border-b border-indigo-700 shadow-lg">
            {/* Left Side: Logo/Title */}
            <div className="flex items-center space-x-2">
                <MessageSquare className="w-8 h-8 text-indigo-400" />
                <h1 className="text-2xl font-bold tracking-widest text-white">{isMobile ? 'T-Chat' : 'TranslaChat'}</h1>
                {isMobile && (
                    <button onClick={toggleSidebar} className="text-white p-1">
                        <Menu className="w-6 h-6 text-indigo-400" />
                    </button>
                )}
            </div>
            {/* Right Side: Logout */}
            <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1 text-sm font-medium text-white border border-white rounded-lg hover:bg-white hover:text-gray-900 transition duration-200"
            >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
            </button>
        </header>
    );
};

export default Header