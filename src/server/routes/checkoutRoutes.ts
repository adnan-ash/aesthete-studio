import { Router } from 'express';
import { createCheckoutSession } from '../controllers/checkoutController';

const router = Router();

router.post('/session', createCheckoutSession);

export default router;
