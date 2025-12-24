
require('dotenv').config();
import express, { json } from 'express';
import connectDB from './app/config/db.config.js';
import apiRouter from './app/routes/index.js';
import { createServer } from 'http'; // Standard Node.js module
import { Server } from 'socket.io'; // Socket.IO Server
import { handleSocketEvents } from './app/socket/socketHandler.js';
import cors from 'cors';

const app = express();
app.use(cors())

// for socket 
const httpServer = createServer(app); // Create HTTP server using Express app
// --- Socket.IO Setup ---
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Replace with your frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

connectDB();
app.use(json());
app.use('/api', apiRouter);

// --- WebSocket Logic ---
// We'll move the core socket logic to a dedicated file later, but define the basic connection here
io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
handleSocketEvents(io);

const port = process.env.PORT || 10000;
// IMPORTANT: Listen using the httpServer, NOT the Express app
httpServer.listen(port, () => { 
    console.log(`HTTP/Socket server running at port ${port}`);
});

export default app;
