
import { 
    registerUser, 
    loginUser, 
    logoutUser 
} from '../services/auth.service.js';

// --- Helper function for consistent response formatting ---
const sendAuthResponse = (res, user, token, statusCode = 200) => {
    // We explicitly exclude the password hash from the response
    const userResponse = { 
        _id: user._id, 
        name: user.name, 
        email: user.email 
    };

    // Note: You would often set the token in an HTTP-only cookie here
    res.status(statusCode).json({
        success: true,
        token: token,
        user: userResponse
    });
};


export async function registerController(req, res, next) {
    try {
        const { name, email, password } = req.body;
        
        // Input validation (essential for a production app!)
        if (!name || !email || !password) {
            const error = new Error('Please provide name, email, and password.');
            error.statusCode = 400; // Bad Request
            throw error;
        }

        // Call the service layer to handle logic and database interaction
        const { user, token } = await registerUser(name, email, password);

        sendAuthResponse(res, user, token, 201); // 201 Created

    } catch (error) {
        // Pass error to Express error handling middleware
        next(error);
    }
}


// 2. LOGIN CONTROLLER
export async function loginController(req, res, next) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('Please provide email and password.');
            error.statusCode = 400;
            throw error;
        }

        // Call the service layer
        const { user, token } = await loginUser(email, password);

        sendAuthResponse(res, user, token, 200);

    } catch (error) {
        next(error);
    }
}


// 3. LOGOUT CONTROLLER
export async function logoutController(req, res, next) {
    try {
        // Logout logic usually involves clearing the cookie/token on the client side.
        // We'll simulate a server-side action and confirm success.
        
        // Note: If you are using cookies, you would do:
        // res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });

        // Call the service layer (optional for stateless APIs)
        await logoutUser(req.userId); // Assuming middleware provides req.userId

        res.status(200).json({ 
            success: true, 
            message: 'Successfully logged out (token cleared on client side).' 
        });

    } catch (error) {
        next(error);
    }
}
