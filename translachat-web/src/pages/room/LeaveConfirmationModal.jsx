// Defined within RoomList.jsx or in a separate file

const LeaveConfirmationModal = ({ room, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full border border-red-700">
            <h3 className="text-xl font-bold text-white mb-4">Leave {room.name}?</h3>
            <p className="text-gray-300 mb-6">
                Are you sure you want to leave this room? You can join again anytime.
            </p>
            <div className="flex justify-end space-x-4">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                >
                    Cancel
                </button>
                <button
                    onClick={() => onConfirm(room._id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                >
                    Confirm Leave
                </button>
            </div>
        </div>
    </div>
);

export default LeaveConfirmationModal