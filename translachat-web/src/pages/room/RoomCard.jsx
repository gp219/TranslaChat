import { Delete } from "lucide-react";

const RoomCard = ({ room, onRoomClick }) => {
    // Determine if the current user is a member of the room
    const isJoined = room.isJoined;

    return (
        <div 
            className="p-4 bg-gray-800 rounded-xl shadow-xl hover:shadow-indigo-500/30 transition duration-300 cursor-pointer"
            onClick={() => onRoomClick(room)}
        >
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-indigo-400 truncate">{room.name}</h4>
    
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isJoined ? 'bg-green-700 text-green-200' : 'bg-yellow-700 text-yellow-200'}`}>
                    {isJoined ? 'Joined' : 'Joinable'}
                </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 flex flex-row">
                Members: {room.members.length}
            </p>
        </div>
    );
};

export default RoomCard