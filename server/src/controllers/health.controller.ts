import { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync';
import { config } from '@/config/env';

export const healthController = {
  check: catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Defter Server is healthy',
      env: config.NODE_ENV,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  })
};