import { userRepository } from '@/repositories/user.repository';
import { AppError } from '@/utils/AppError';
import { comparePassword, signToken } from '@/utils/security';
import { formatters } from '@/utils/formatters';
import { AuthResponseDTO } from '@/types/auth.dto';

export const authService = {
  
  /**
   * Handles User Login logic.
   * @returns AuthResponseDTO - Typed response contract.
   */
  login: async (identityRaw: string, password: string): Promise<AuthResponseDTO> => {
    const isPhone = /[0-9]{9,}/.test(identityRaw);
    const identity = isPhone ? formatters.sanitizePhone(identityRaw) : identityRaw.trim();

    const user = await userRepository.findByIdentity(identity);
    
    if (!user) {
      throw new AppError('Invalid credentials.', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated.', 403);
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials.', 401);
    }

    const role = user.role_slug || 'member'; 
    const token = signToken({ id: user.id, role });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: role
      }
    };
  }
};