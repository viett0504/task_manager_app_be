import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const calendarController = new CalendarController();

router.use(authenticate);

router.get('/tasks', calendarController.getCalendarTasks);
router.get('/conflicts', calendarController.getConflicts);

export default router;
