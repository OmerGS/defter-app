import { Request, Response } from 'express';
import { catchAsync } from '@/utils/catchAsync';
import { authService } from '@/services/auth.service';
import { AppError } from '@/utils/AppError';
import { LoginSchema, LoginRequestDTO } from '@/types/auth.dto';

export const authController = {
  
  /**
   * POST /api/v1/auth/login
   */
  login: catchAsync(async (req: Request, res: Response) => {
    const validation = LoginSchema.safeParse(req.body);
    
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message ?? "Validation failed";
      throw new AppError(errorMessage, 400);
    }

    const { identity, password }: LoginRequestDTO = validation.data;
    
    const result = await authService.login(identity, password);

    // 4. Respond
    res.status(200).json({
      status: 'success',
      message: 'Login successful', 
      data: result
    });
  })
};