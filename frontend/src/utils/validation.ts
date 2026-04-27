import { z } from 'zod';
import { VALIDATION_RULES } from '../constants';

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_RULES.EMAIL.REQUIRED)
    .email(VALIDATION_RULES.EMAIL.INVALID),
  password: z
    .string()
    .min(1, VALIDATION_RULES.PASSWORD.REQUIRED)
    .min(8, VALIDATION_RULES.PASSWORD.MIN_LENGTH),
});

export const signUpSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  country: z.string().trim().min(1, 'Country is required').max(100),
  age: z.coerce
    .number()
    .int('Age must be a whole number')
    .min(1, 'Age is required')
    .max(150, 'Age must be 150 or less'),
  email: z
    .string()
    .trim()
    .min(1, VALIDATION_RULES.EMAIL.REQUIRED)
    .email(VALIDATION_RULES.EMAIL.INVALID)
    .max(100),
  password: z
    .string()
    .min(8, VALIDATION_RULES.PASSWORD.MIN_LENGTH)
    .max(50),
});

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, VALIDATION_RULES.URL.REQUIRED)
    .url(VALIDATION_RULES.URL.INVALID),
  customAlias: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormInput = z.input<typeof signUpSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type CreateUrlFormData = z.infer<typeof createUrlSchema>;
