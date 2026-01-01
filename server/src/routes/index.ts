import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// --- API VERSION 1 ROUTES ---
router.use('/health', healthRoutes);

export default router;