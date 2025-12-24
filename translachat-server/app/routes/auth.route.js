import { Router } from 'express';
const router = Router();
import { registerController, loginController, logoutController } from '../controllers/auth.controller.js';

router.post('/register', registerController)
router.post('/login', loginController)
router.post('/logout', logoutController)

export default router;
