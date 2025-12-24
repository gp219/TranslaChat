// app/routes/room.route.js

import { Router } from 'express';
const router = Router();
import { 
    createRoomController, 
    joinRoomController, 
    leaveRoomController,
    getRoomsController,
    getRoomDetailsController
} from '../controllers/room.controller.js';
import { protect } from '../middlewares/auth.middleware.js'

// Apply the protect middleware to all routes that require authentication
router.get('/', protect, getRoomsController); 
router.post('/create', protect, createRoomController);
router.post('/:id/join', protect, joinRoomController);
router.post('/:id/leave', protect, leaveRoomController);
router.get('/:id', protect, getRoomDetailsController)

export default router;