import { z } from 'zod';
import { VALIDATION_RULES } from '../constants';

const namePattern = /^[a-zA-Z'-]+$/;
const countryPattern = /^[a-zA-Z'\-]+(\s[a-zA-Z'\-]+)*$/;

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
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or less')
    .regex(namePattern, 'First name contains invalid characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or less')
    .regex(namePattern, 'Last name contains invalid characters'),
  country: z
    .string()
    .trim()
    .min(1, 'Country is required')
    .max(50, 'Country must be 50 characters or less')
    .regex(countryPattern, 'Country contains invalid characters'),
  age: z.coerce
    .number()
    .int('Age must be a whole number')
    .min(13, 'Age must be between 13 and 120')
    .max(120, 'Age must be between 13 and 120'),
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
  acceptTerms: z.boolean().refine((value) => value, {
    message: 'You must accept the terms to continue',
  }),
});

export const createUrlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, VALIDATION_RULES.URL.REQUIRED)
    .url(VALIDATION_RULES.URL.INVALID),
  daysCount: z.coerce.number().int().min(1).max(365).optional(),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormInput = z.input<typeof signUpSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type CreateUrlFormData = z.infer<typeof createUrlSchema>;
