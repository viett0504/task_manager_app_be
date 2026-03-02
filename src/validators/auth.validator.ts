import { body } from 'express-validator';

export const registerSchema = [
  body('email')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain uppercase, lowercase, number and special character'
    ),
  body('full_name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
];

export const loginSchema = [
  body('email').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
