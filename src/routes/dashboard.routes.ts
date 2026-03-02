import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/ai-insights', dashboardController.getAIInsights);

export default router;
