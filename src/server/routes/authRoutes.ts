import { Router } from 'express';
import { register, login, googleAuthIn } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuthIn);

export default router;
