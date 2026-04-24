import { z } from 'zod';

export const registrationSchema = z.object({
  email: z.string().email('Некорректный email'),
  username: z.string().min(3, 'Минимум 3 символа').max(20, 'Максимум 20 символов'),
  firstName: z.string().min(1, 'Имя обязательно').max(50, 'Максимум 50 символов'),
  lastName: z.string().min(1, 'Фамилия обязательна').max(50, 'Максимум 50 символов'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Некорректный номер телефона'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
