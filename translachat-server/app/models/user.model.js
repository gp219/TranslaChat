// app/models/user.model.js

import { Schema, model } from 'mongoose';

// 1. Define the User Schema
const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'], // Enforce presence
        unique: true,                          // Enforce uniqueness
        trim: true,                            // Remove whitespace
        lowercase: true,                       // Save in lowercase
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please fill a valid email address'] // Basic email regex
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
        trim: true  
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    accountDisabled: {
        type: Boolean,
        default: false
    },
    preferredLanguage: {
        type: String,
        default: 'en',
        enum: ['en', 'es', 'fr', 'de', 'zh', 'ar'], // List of supported languages (optional but good for validation)
        required: true
    },
    // You might add fields like role, name, createdAt, etc. here
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 2. Export the Model
// Mongoose will automatically create a collection named 'users' 
// (lowercase plural of 'User') in MongoDB.
const User = model('User', userSchema);
export default User;