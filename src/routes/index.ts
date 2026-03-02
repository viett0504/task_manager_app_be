import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import sprintRoutes from './sprint.routes';
import teamRoutes from './team.routes';
import calendarRoutes from './calendar.routes';
import aiRoutes from './ai.routes';
import dashboardRoutes from './dashboard.routes';
import notificationRoutes from './notification.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/sprints', sprintRoutes);
router.use('/teams', teamRoutes);
router.use('/calendar', calendarRoutes);
router.use('/ai', aiRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

export default router;
