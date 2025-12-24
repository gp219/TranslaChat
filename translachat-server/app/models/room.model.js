import mongoose, { Schema } from 'mongoose';

// --- 2a. Message Sub-Schema (Embedded) ---
// Stores the original, untranslated message history
const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: true
    },
    originalText: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000 
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false }); // Prevents Mongoose from creating an _id for each embedded message

// --- 2b. Room Schema ---
const roomSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Room name is required'],
        unique: true,
        trim: true,
        maxlength: 50
    },
    creator: { // <-- New field to track the room owner
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{ // Array of User IDs currently in the room
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    history: [messageSchema], // Array of embedded Message Objects
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Room = mongoose.model('Room', roomSchema);
export default Room;