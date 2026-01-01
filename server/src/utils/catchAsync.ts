import { Request, Response, NextFunction } from 'express';

// Type definition for an asynchronous controller function
type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const catchAsync = (fn: AsyncController) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Pass any error to the global error handling middleware
    fn(req, res, next).catch(next);
  };
};