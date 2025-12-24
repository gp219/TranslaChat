import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle, User, X } from 'lucide-react';
import SearchInput from "./SearchInput";
import { useState } from "react";
import { useMemo } from "react";
import { useResponsive } from "../contexts/ResponsiveContext";

const Sidebar = ({ username, joinedRooms, isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const { isMobile } = useResponsive();
    
    // Handler to switch rooms
    const handleRoomSwitch = (roomId) => {
        navigate(`/room/${roomId}`);
        setIsOpen(false)
    };

    const filteredRooms = useMemo(() => {
        if (!searchQuery) {
            return joinedRooms;
        }
        const lowerCaseQuery = searchQuery.toLowerCase();
        return joinedRooms.filter(room => 
            room.name.toLowerCase().includes(lowerCaseQuery)
        );
    }, [joinedRooms, searchQuery]);

    const sidebarContent = (
        <div className={`
            ${isMobile ? 'w-72 h-full' : 'w-64'} 
            p-4 flex flex-col bg-gray-900 border-r border-indigo-700 h-full
        `}>
            {/* User Profile Info */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3 text-white p-2 rounded-lg bg-gray-800 border border-gray-700 flex-1">
                    <User className="w-5 h-5 text-indigo-400" /> 
                    <span className="text-sm font-semibold truncate capitalize">{username}</span>
                </div>
                {isMobile && (
                    <button onClick={() => setIsOpen(false)} className="ml-2 text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            
            <div className="flex-1">
                
                {/* Section Heading */}
                <h3 className="text-xs uppercase font-extrabold text-indigo-400 mb-3 tracking-wider">
                    My Chats
                </h3>
                <div className="mb-4">
                    <SearchInput 
                        placeholder="Search your chats..."
                        onSearch={setSearchQuery}
                    />
                </div>
                
                {filteredRooms.length === 0 ? (
                    // Empty state styling
                    <p className="text-gray-500 text-sm italic p-2">Join a room to see it here.</p>
                ) : (
                    // Room List Styling
                    <nav className="space-y-2 overflow-y-auto custom-scrollbar" style={{"height": "60vh"}}>
                        {filteredRooms.map((room) => {
                            // Check if the current room in the sidebar is the active room
                            const isActive = location.pathname.includes(`/room/${room._id}`);
                            
                            return (
                                <button
                                    key={room._id}
                                    onClick={() => handleRoomSwitch(room._id)}
                                    // Use distinct colors and box shadow for active state
                                    className={`w-full flex items-center p-3 rounded-lg text-left transition duration-200 
                                                ${isActive 
                                                    ? 'bg-indigo-700 text-white font-semibold shadow-indigo-500/30 shadow-md' 
                                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                }`}
                                >
                                    {/* Icon Styling: Make it pop slightly */}
                                    <MessageCircle className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                                    
                                    {/* Room Name Styling */}
                                    <span className="text-sm truncate">{room.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                )}
            </div>
        </div>
    )
    
    if (isMobile) {
        return (
            <>
                {/* Backdrop overlay */}
                {isOpen && (
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
                        onClick={() => setIsOpen(false)}
                    />
                )}
                {/* Sliding Drawer */}
                <div className={`
                    fixed top-0 left-0 z-70 h-full transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    {sidebarContent}
                </div>
            </>
        );
    }

    // Standard Desktop Sidebar
    return sidebarContent;
}

export default Sidebar;