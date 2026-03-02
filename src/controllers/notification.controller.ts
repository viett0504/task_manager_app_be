import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';

export class NotificationController {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, message: 'Get notifications - to be implemented' });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, message: 'Mark as read - to be implemented' });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({ success: true, message: 'Mark all as read - to be implemented' });
    } catch (error) {
      next(error);
    }
  }
}
