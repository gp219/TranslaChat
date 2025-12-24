
import jwt from 'jsonwebtoken';

// IMPORTANT: Get the secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET; 

export async function protect(req, res, next) {
    let token;

    // 1. Check if token exists in the 'Authorization' header
    // The token is typically sent as: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token part
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using the secret key
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. Extract the user ID from the decoded payload
            // We only attach the ID to keep the middleware lightweight
            req.userId = decoded.userId;

            // 4. Move to the next middleware/controller
            next();

        } catch (error) {
            // Token is invalid (e.g., expired, incorrect signature)
            console.error('JWT Verification Error:', error.message);
            res.status(401).json({ 
                success: false, 
                message: 'Not authorized, token failed or expired.' 
            });
        }
    }

    // 5. Handle case where no token is provided
    if (!token) {
        res.status(401).json({ 
            success: false, 
            message: 'Not authorized, no token provided.' 
        });
    }
}