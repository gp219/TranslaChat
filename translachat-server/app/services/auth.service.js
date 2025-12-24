
import User from '../models/user.model.js'; // Note the .js extension for ESM
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // We'll need JWT for tokens

// IMPORTANT: Define a secret key for signing JWTs (store this in a .env file!)
const JWT_SECRET = process.env.JWT_SECRET || '3febee99ba1c3e949ad0c77e0f3a0180d49fd62028b9bfd61ccaf01266e49dd8'; 

// --- Helper function for creating a token ---
const createToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
};


// 1. REGISTER SERVICE
export async function registerUser(name, email, password) {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        // Throw an error that the controller can catch
        const error = new Error('User already exists.');
        error.statusCode = 409; // Conflict
        throw error;
    }

    // 2. Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 3. Create the new user document
    const newUser = await User.create({ 
        name, 
        email, 
        password: hashedPassword 
    });

    // 4. Create a token for the new user
    const token = createToken(newUser._id);

    return { user: newUser, token };
}

// 2. LOGIN SERVICE
export async function loginUser(email, password) {
    // 1. Find user by email
    const user = await User.findOne({ email }).select('+password'); // Explicitly select password field
    
    // Check if user exists OR if account is disabled
    if (!user || user.accountDisabled) {
        const error = new Error('Invalid credentials or account is disabled.');
        error.statusCode = 401; // Unauthorized
        throw error;
    }

    // 2. Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid credentials.');
        error.statusCode = 401; // Unauthorized
        throw error;
    }
    
    // 3. Create a token for the logged-in user
    const token = createToken(user._id);

    // Return user object without the password hash
    return { user, token };
}

// 3. LOGOUT SERVICE
// Logout is generally client-side (deleting the token), but we include this 
// for completeness, often used for token blacklist or session clearing.
export async function logoutUser(userId) {
    // For JWTs, logout is purely client-side. If using server-side sessions 
    // or refresh tokens, this is where you'd invalidate them.
    
    // For a stateless API, we just confirm the action.
    return { message: "Token managed client-side, effective logout confirmed." };
}