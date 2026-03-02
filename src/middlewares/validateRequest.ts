import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from '../utils/AppError';

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err: any) => ({
      field: err.path,
      message: err.msg,
    }));

    throw new AppError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      extractedErrors
    );
  };
};
