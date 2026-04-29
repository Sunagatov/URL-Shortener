import { Page } from '@playwright/test';

/**
 * Helper function to sign up a new user
 */
export async function signUpUser(page: Page, email?: string) {
  const uniqueEmail = email || `test.user.${Date.now()}@example.com`;
  
  await page.goto('/signup');
  await page.getByLabel(/first name/i).fill('Test');
  await page.getByLabel(/last name/i).fill('User');
  await page.getByLabel(/email/i).fill(uniqueEmail);
  await page.getByLabel(/country/i).fill('United States');
  await page.getByLabel(/age/i).fill('25');
  await page.getByLabel(/password/i).fill('TestPassword123!');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /create account/i }).click();
  
  await page.waitForURL('**/', { timeout: 10000 });
  
  return uniqueEmail;
}

/**
 * Helper function to sign in an existing user
 */
export async function signInUser(page: Page, email: string, password: string = 'TestPassword123!') {
  await page.goto('/signin');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  
  await page.waitForURL('**/', { timeout: 10000 });
}

/**
 * Helper function to sign out the current user through the account menu
 */
export async function signOutUser(page: Page) {
  await page.getByRole('button', { name: /account/i }).click();
  await page.getByRole('button', { name: /sign out/i }).click();
  await page.waitForURL('**/', { timeout: 10000 });
}

/**
 * Helper function to respect rate limiter
 */
export async function waitForRateLimiter(page: Page, ms: number = 2000) {
  await page.waitForTimeout(ms);
}

/**
 * Helper function to shorten a URL
 */
export async function shortenUrl(page: Page, url: string) {
  await page.getByPlaceholder(/enter.*url/i).fill(url);
  await page.getByRole('button', { name: /shorten/i }).click();
  await page.waitForTimeout(3000); // Wait for API response
}
