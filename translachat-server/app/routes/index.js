
import { Router } from 'express';
const router = Router();

import authRoutes from './auth.route.js'; 
import roomRoutes from './room.route.js'; // <-- NEW Import

router.use('/', authRoutes);
router.use('/rooms', roomRoutes); // <-- Mounts at /api/rooms

export default router;
