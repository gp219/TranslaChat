// app/services/room.service.js

import Room from '../models/room.model.js';
import User from '../models/user.model.js';

// 1. CREATE ROOM SERVICE
export async function createRoom(roomName, userId) {
    // Check if room name already exists
    const existingRoom = await Room.findOne({ name: roomName });
    if (existingRoom) {
        const error = new Error('Room name already taken.');
        error.statusCode = 409;
        throw error;
    }

    // Create the room and automatically make the creator a member
    const newRoom = await Room.create({ 
        name: roomName,
        members: [userId], // Creator is the first member
        creator: userId
    });

    return newRoom;
}

// 2. JOIN ROOM SERVICE
export async function joinRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    if (!room) {
        const error = new Error('Room not found.');
        error.statusCode = 404;
        throw error;
    }

    // Check if the user is already in the room
    if (room.members.includes(userId)) {
        return room; // Already joined
    }

    // Add user to the members array
    room.members.push(userId);
    await room.save();
    
    return room;
}

// 3. LEAVE ROOM SERVICE
export async function leaveRoom(roomId, userId) {
    const room = await Room.findById(roomId);
    if (!room) {
        const error = new Error('Room not found.');
        error.statusCode = 404;
        throw error;
    }

    // Pull (remove) the user ID from the members array
    room.members.pull(userId);
    await room.save();

    return room;
}

// 4. GET ROOMS SERVICE (for displaying a list)
export async function getAllRooms(userId, filter) {
    let query = {}; // Start with an empty query (gets all rooms)

    if (filter === 'joined') {
        // Find rooms where the members array contains the user's ID
        query = { members: userId };
    }
    if (filter === 'created') {
        query = { creator: userId };
    }
    return await Room.find(query)
                     .select('name members createdAt')
                     .lean(); // Return a simplified list
}

export async function getRoomDetails(roomId) {
    console.log("roomId : ",roomId);
    
    // We select the name, members, and history fields.
    const room = await Room.findById(roomId)
        .select('name members history')
        .populate({
            path: 'history.sender', // Populate the sender field in the history array
            select: 'name'          // Only retrieve the 'name' field from the User model
        })
        .populate({
            path: 'members',        // Populate the members array
            select: 'name'          // Only retrieve the 'name' field from the User model
        });

    return room;
}