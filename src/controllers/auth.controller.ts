import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService = new AuthService();

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, full_name } = req.body;
      const result = await this.authService.register(email, password, full_name);
      
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement refresh token logic
      res.json({
        success: true,
        message: 'Refresh token endpoint - to be implemented',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement logout logic
      res.json({
        success: true,
        message: 'Logout endpoint - to be implemented',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement forgot password logic
      res.json({
        success: true,
        message: 'Forgot password endpoint - to be implemented',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      // TODO: Implement reset password logic
      res.json({
        success: true,
        message: 'Reset password endpoint - to be implemented',
      });
    } catch (error) {
      next(error);
    }
  }
}
