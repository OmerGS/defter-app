import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';

const router = Router();

// --- API VERSION 1 ROUTES ---
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

export default router;