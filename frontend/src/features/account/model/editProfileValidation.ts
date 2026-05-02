import { z } from 'zod';

const namePattern = /^[a-zA-Z'-]+$/;
const countryPattern = /^[a-zA-Z'-]+(\s[a-zA-Z'-]+)*$/;

export const editProfileSchema = z.object({
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
    .max(50, 'Country must be 50 characters or less')
    .regex(countryPattern, 'Country contains invalid characters')
    .optional()
    .or(z.literal('')),
  age: z.coerce
    .number()
    .int('Age must be a whole number')
    .min(13, 'Age must be between 13 and 120')
    .max(120, 'Age must be between 13 and 120')
    .optional()
    .or(z.literal('')),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type EditProfileFormInput = z.input<typeof editProfileSchema>;
