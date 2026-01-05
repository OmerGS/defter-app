import { z } from 'zod';

export const LoginSchema = z.object({
  identity: z.string().min(3, "Identity is required"),
  password: z.string().min(1, "Password is required")
});

export type LoginRequestDTO = z.infer<typeof LoginSchema>;

export interface AuthResponseDTO {
  token: string;
  user: {
    id: number;
    email: string | null;
    phone: string | null;
    role: string;
  };
}