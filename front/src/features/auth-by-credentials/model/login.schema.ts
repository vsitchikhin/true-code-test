import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Минимум 3 символа'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
