import { Route, Routes } from "react-router-dom";
import RoomList from "./RoomList";
import Room from "./Room";
import { getUserData } from "../../services/storageServices";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { useState } from "react";
import apiClient from "../../services/apiClient";
import { useEffect } from "react";
import { useCallback } from "react";
import { ToastProvider } from "../../contexts/ToastContext";

const Layout = () => {
    const user = getUserData();
    const [joinedRooms, setJoinedRooms] = useState([]);

    const [refetchTrigger, setRefetchTrigger] = useState(0); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // 2. NEW FUNCTION: Callback to be passed down
    const refreshRooms = useCallback(() => {
        // Increment the state to force the useEffect dependency array to change
        setRefetchTrigger(prev => prev + 1);
    }, []); // This function never changes
    
    useEffect(() => {
        if (user?._id) {
            const fetchJoinedRooms = async () => {
                try {
                    const response = await apiClient.get('/rooms?filter=joined');
                    setJoinedRooms(response.data.rooms);
                } catch (error) {
                    console.error('Failed to fetch joined rooms for sidebar:', error);
                }
            };
            fetchJoinedRooms();
        }
    }, [user?._id, refetchTrigger]);

    return (
        <ToastProvider>
            <div className="min-h-screen flex flex-col bg-gray-900"> 
                <Header username={user.name} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                
                <div className="flex flex-1">
                    <Sidebar username={user.name} joinedRooms={joinedRooms} isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen} />
                    
                    {/* Main Content Area */}
                    <main className="flex-1 h-full" style={{"height": "86vh"}}> 
                        <Routes>
                            <Route path="/" element={<RoomList refreshRooms={refreshRooms} />} />
                            <Route path="rooms" element={<RoomList refreshRooms={refreshRooms} />} />
                            <Route path="room/:id" element={<Room />} />
                        </Routes>
                    </main>
                    
                </div>
                {/* Footer */}
                <footer className="p-2 text-center text-xs text-gray-500 bg-gray-900 border-t border-indigo-700">
                    &copy; {new Date().getFullYear()} TranslaChat. Multi-Lingual Real-Time Chat.
                </footer>
            </div>
        </ToastProvider>
    );
}

export default Layout;