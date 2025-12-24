
import Room from '../../app/models/room.model.js';

// This map stores: [socketId]: { userId, preferredLanguage, roomId, name }
const activeUsers = {}; 

/**
 * Helper to get a unique list of user IDs currently in a specific room
 */
const getOnlineUsersInRoom = (roomId) => {
    const users = Object.values(activeUsers)
        .filter(user => user.roomId === roomId)
        .map(user => user.userId);
    
    // Use Set to ensure unique IDs if a user is connected on multiple devices
    return [...new Set(users)];
};

export function handleSocketEvents(io) {
    io.on('connection', (socket) => {
        const socketId = socket.id;
        console.log(`User connected: ${socketId}`);

        // --- Event 1: JOIN ROOM ---
        socket.on('joinRoom', async ({ roomId, userId, preferredLanguage, name }) => {
            socket.join(roomId);

            // Store user state (Added 'name' and 'roomId' for easier lookup)
            activeUsers[socketId] = { userId, preferredLanguage, roomId, name };

            // A. Notify the joining client
            socket.emit('roomJoined', { success: true, roomId });

            // B. Broadcast UPDATED member list to EVERYONE in the room (including sender)
            const onlineUsers = getOnlineUsersInRoom(roomId);
            io.to(roomId).emit('updateMemberList', onlineUsers);

            // C. Notification (to everyone else)
            socket.to(roomId).emit('notification', { 
                message: `${name || 'A user'} joined the room.` 
            });
        });

        // --- Event 2: SEND MESSAGE ---
        socket.on('sendMessage', async ({ roomId, originalText }) => {
            const senderInfo = activeUsers[socketId];
            if (!senderInfo || !roomId || !originalText) return;
            
            const { userId, preferredLanguage } = senderInfo;
            
            try {
                const newMessage = {
                    sender: userId,
                    originalText: originalText,
                    timestamp: new Date()
                };

                await Room.findByIdAndUpdate(roomId, {
                    $push: { history: newMessage }
                });
                
                const broadcastPayload = {
                    senderId: userId,
                    senderLanguage: preferredLanguage,
                    translatedText: originalText, 
                    originalText: originalText,
                    roomId: roomId,
                    timestamp: newMessage.timestamp
                };

                io.to(roomId).emit('newMessage', broadcastPayload);
                
            } catch (error) {
                console.error('Error saving or broadcasting message:', error);
                socket.emit('error', { message: 'Failed to send message.' });
            }
        });

        // --- NEW: Event 3: TYPING INDICATORS ---
        // We use socket.to(roomId) so the person typing doesn't see their own "typing" status
        socket.on('typing', ({ roomId, userId, name }) => {
            socket.to(roomId).emit('userTyping', { userId, name });
        });

        socket.on('stopTyping', ({ roomId, userId }) => {
            socket.to(roomId).emit('userStoppedTyping', { userId });
        });

        // --- Event 4: DISCONNECT ---
        socket.on('disconnect', () => {
            const user = activeUsers[socketId];
            
            if (user) {
                const { roomId, name, userId } = user;
                console.log(`User disconnected: ${name} (${socketId})`);
                
                // 1. Remove from active map
                delete activeUsers[socketId];

                // 2. Broadcast updated member list to the room they left
                const onlineUsers = getOnlineUsersInRoom(roomId);
                io.to(roomId).emit('updateMemberList', onlineUsers);

                // 3. Immediately clear their typing status just in case
                socket.to(roomId).emit('userStoppedTyping', { userId });
            }
        });
    });
}