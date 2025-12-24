import { useEffect } from "react";
import apiClient from "../../services/apiClient";
import { getUserData } from "../../services/storageServices";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, X } from 'lucide-react';
import RoomCard from "./RoomCard";
import CreateRoomModal from "./CreateRoomModal";
import JoinConfirmationModal from "./JoinConfirmationModal";
import Spinner from "../../components/Spinner";
import SearchInput from "../../components/SearchInput";
import { useMemo } from "react";
import { useToast } from "../../custom hooks/useToast";
import { useResponsive } from "../../contexts/ResponsiveContext";

const RoomList = ({ refreshRooms }) => {
    const { isMobile } = useResponsive();
    const navigate = useNavigate();
    const [allRooms, setAllRooms] = useState([]);
    const [filter, setFilter] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalRoom, setModalRoom] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();
    const userId = getUserData() ? getUserData()._id : null;

    // Function to fetch rooms based on the current filter
    const fetchRooms = async (currentFilter) => {
        setIsLoading(true);
        try {
            // Determine the correct API path
            let path = currentFilter ? `/rooms?filter=${currentFilter}` : '/rooms';
            const response = await apiClient.get(path);
            
            // Augment data to check if the current user is a member (for 'all' filter)
            const roomsWithStatus = response.data.rooms.map(room => ({
                ...room,
                isJoined: room.members.includes(userId)
            }));
            
            setAllRooms(roomsWithStatus);

        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            setAllRooms([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Function to handle joining a room
    const handleJoinRoom = async (roomId) => {
        try {
            await apiClient.post(`/rooms/${roomId}/join`);
            showToast('Successfully joined the room!', 'success');
            setIsModalOpen(false);
            
            // Reroute to the chat room after joining
            navigate(`/room/${roomId}`);
            if (refreshRooms) {
                refreshRooms(); 
            } 
            
        } catch (error) {
            showToast(`Failed to join room: ${error.response?.data?.message || 'Server error'}`, 'error');
        }
    };

    const handleCreateRoom = async (roomName) => {
        setIsLoading(true); // Reuse isLoading for the create process
        try {
            const response = await apiClient.post('/rooms/create', { name: roomName });
            
            showToast(`Room "${roomName}" created successfully!`, 'success');
            setIsCreateModalOpen(false);
            
            // Navigate directly to the newly created room
            navigate(`/room/${response.data.room._id}`); 
            if (refreshRooms) {
                refreshRooms(); 
            }
        } catch (error) {
            showToast(`Failed to create room: ${error.response?.data?.message || 'Server error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Effects & Handlers ---

    useEffect(() => {
        if (userId) {
            fetchRooms(filter);
        }
    }, [filter]); // Rerun when filter changes

    const handleRoomClick = (room) => {
        if (room.isJoined) {
            // Already joined: navigate directly to the chat
            navigate(`/room/${room._id}`);
        } else {
            // Not joined: show confirmation modal
            setModalRoom(room);
            setIsModalOpen(true);
        }
    };

    const filteredRooms = useMemo(() => {
        let rooms = allRooms; // Start with the fetched list
        
        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            rooms = rooms.filter(room => 
                room.name.toLowerCase().includes(lowerCaseQuery)
            );
        }
        // If filter is 'joined', this list should already be filtered by the API, 
        // but if filter is 'all', this memo ensures we only show matching rooms.
        return rooms;
    }, [allRooms, searchQuery]);

    return (
        <div className={`flex flex-col flex-1 bg-gray-900 min-h-full ${isMobile ? 'p-4' : 'p-8'}`}>
            <div className={`flex justify-between items-center mb-6 ${isMobile ? 'flex-col gap-y-4' : ''}`}>
                    <div className="flex space-x-4 p-1 bg-gray-800 rounded-full shadow-inner">
                        <button
                            onClick={() => setFilter('')}
                            className={`px-4 py-2 text-sm rounded-full font-semibold transition duration-200 ${filter === '' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            All Rooms
                        </button>
                        <button
                            onClick={() => setFilter('joined')}
                            className={`px-4 py-2 text-sm rounded-full font-semibold transition duration-200 ${filter === 'joined' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Joined By Me
                        </button>
                        <button
                            onClick={() => setFilter('created')}
                            className={`px-4 py-2 text-sm rounded-full font-semibold transition duration-200 ${filter === 'created' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                        >
                            Created By Me
                        </button>
                    </div>
                <div className={`flex items-center justify-end gap-x-4 flex-1 ${isMobile}`}>

                    <div className="w-[50%]">
                        <SearchInput 
                            placeholder="Search a room..."
                            delay={500}
                            onSearch={setSearchQuery} 
                        />
                    </div>
                <button 
                    onClick={() => setIsCreateModalOpen(true)} 
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition duration-200"
                    disabled={isLoading}
                >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Room</span>
                </button>

                </div>
            </div>

            {/* Room Grid */}
            <h2 className="text-2xl font-bold text-white mb-4">
                {filter === '' ? 'Explore All Rooms' : 'My Joined Rooms'}
            </h2>
            
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
                    <Spinner size="xl" color="indigo" />
                    <div className="mt-4 text-xl font-semibold text-indigo-400">
                    Loading Rooms...
                    </div>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="text-gray-500 text-lg p-10 border border-dashed border-gray-700 rounded-xl text-center">
                    {filter === 'joined' ? "You haven't joined any rooms yet." : "No rooms available."}
                </div>
            ) : (
                <div style={{"height": "64vh"}} className="overflow-y-auto custom-scrollbar pr-2"> 
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRooms.map(room => (
                            <RoomCard key={room._id} room={room} onRoomClick={handleRoomClick} />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Join Confirmation Modal */}
            {isModalOpen && modalRoom && (
                <JoinConfirmationModal
                    room={modalRoom} 
                    onConfirm={handleJoinRoom} 
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            {isCreateModalOpen && (
                <CreateRoomModal
                    onCreate={handleCreateRoom}
                    onClose={() => setIsCreateModalOpen(false)}
                    isLoading={isLoading}
                />
            )}
            
        </div>
    );
};

export default RoomList