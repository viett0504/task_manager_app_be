import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

export class CalendarController {
  async getCalendarTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, message: 'Get calendar tasks - to be implemented' });
    } catch (error) {
      next(error);
    }
  }

  async getConflicts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, message: 'Get conflicts - to be implemented' });
    } catch (error) {
      next(error);
    }
  }
}
