import * as roomService from '../services/room.service.js';
import mongoose from 'mongoose';

// Get all available rooms
export async function getRoomsController(req, res, next) {
    try {
        const userId = req.userId; // Provided by auth middleware
        const filter = req.query.filter; // <-- Extract the filter query parameter (e.g., ?filter=joined)

        // Pass the userId and the filter to the service
        const rooms = await roomService.getAllRooms(userId, filter);
        
        res.status(200).json({ success: true, rooms });
    } catch (error) {
        next(error);
    }
}

// Create a new room
export async function createRoomController(req, res, next) {
    try {
        const { name } = req.body;
        const userId = req.userId; // Provided by auth middleware

        if (!name) {
            const error = new Error('Room name is required.');
            error.statusCode = 400;
            throw error;
        }

        const room = await roomService.createRoom(name, userId);
        res.status(201).json({ success: true, message: 'Room created successfully.', room });
    } catch (error) {
        next(error);
    }
}

// Join a room
export async function joinRoomController(req, res, next) {
    try {
        const { id: roomId } = req.params;
        const userId = req.userId;

        const room = await roomService.joinRoom(roomId, userId);
        res.status(200).json({ success: true, message: 'Joined room successfully.', room });
    } catch (error) {
        next(error);
    }
}

// Leave a room
export async function leaveRoomController(req, res, next) {
    try {
        const { id: roomId } = req.params;
        const userId = req.userId;

        const room = await roomService.leaveRoom(roomId, userId);
        res.status(200).json({ success: true, message: 'Left room successfully.', room });
    } catch (error) {
        next(error);
    }
}

export const getRoomDetailsController = async (req, res) => {
    try {
        const { id: roomId } = req.params;

        const room = await roomService.getRoomDetails(roomId);

        if (!room) {
            return res.status(404).json({ message: "Room not found." });
        };
        
        // Optional check: ensure the user is a member before returning history
        const currentUserId = new mongoose.Types.ObjectId(req.userId);
        const isMember = room.members.some(memberId => memberId.equals(currentUserId));
        if (!isMember) {
             return res.status(403).json({ message: "Access denied. Not a member of this room." });
        }

        res.status(200).json({ room });
    } catch (error) {
        console.error("Error fetching room details:", error);
        res.status(500).json({ message: "Server error while fetching room details." });
    }
};