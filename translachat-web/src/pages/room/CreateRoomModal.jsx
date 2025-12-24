import { useState } from 'react';
import { X, } from 'lucide-react';

const CreateRoomModal = ({ onCreate, onClose, isLoading }) => {
    const [roomName, setRoomName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (roomName.trim().length < 3) {
            setError('Room name must be at least 3 characters long.');
            return;
        }

        onCreate(roomName.trim());
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-lg w-full border border-green-600 relative">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-2xl font-bold text-green-400 mb-6">Create New Room</h3>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
                            Room Name
                        </label>
                        <input
                            type="text"
                            id="roomName"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            disabled={isLoading}
                            placeholder="e.g., General Chat, Spanish Learners"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-green-500 focus:border-green-500 transition duration-150"
                        />
                        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-6 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || roomName.trim().length < 3}
                            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:bg-gray-600 flex items-center justify-center"
                        >
                            {isLoading ? 'Creating...' : 'Create Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomModal