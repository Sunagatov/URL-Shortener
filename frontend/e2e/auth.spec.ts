import { test, expect } from '@playwright/test';
import { signOutUser } from './helpers';

// Generate unique email for each test run to avoid conflicts
const generateUniqueEmail = () => `test.user.${Date.now()}@example.com`;

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add delay between tests to respect rate limiter
    await page.waitForTimeout(1000);
  });

  test('should display sign up page', async ({ page }) => {
    await page.goto('/signup');
    
    // Check if sign up form is visible
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
    await expect(page.getByLabel(/first name/i)).toBeVisible();
    await expect(page.getByLabel(/last name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should validate required fields on sign up', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for validation messages (react-hook-form shows errors)
    await expect(page.locator('text=/required|must/i').first()).toBeVisible({ timeout: 3000 });
  });

  test('should successfully sign up a new user', async ({ page }) => {
    await page.goto('/signup');
    
    const uniqueEmail = generateUniqueEmail();
    
    // Fill in the sign up form using labels
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/country/i).fill('United States');
    await page.getByLabel(/age/i).fill('25');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    
    // Check the terms checkbox
    await page.getByRole('checkbox').check();
    
    // Submit the form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for navigation to home/dashboard (with timeout for API call)
    await page.waitForURL('**/', { timeout: 10000 });
    
    // Verify we're on the home page
    await expect(page).toHaveURL(/\/$/);
  });

  test('should navigate to sign in page', async ({ page }) => {
    await page.goto('/signup');
    
    // Click on "Already have an account? Sign in here"
    await page.getByRole('link', { name: /sign in here/i }).click();
    
    // Verify we're on sign in page
    await expect(page).toHaveURL(/\/signin/);
    await expect(page.getByRole('heading', { name: /sign in|welcome back/i })).toBeVisible();
  });

  test('should sign in with existing credentials', async ({ page }) => {
    // First, create a user
    await page.goto('/signup');
    const uniqueEmail = generateUniqueEmail();
    
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/country/i).fill('United States');
    await page.getByLabel(/age/i).fill('25');
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: /create account/i }).click();
    
    await page.waitForURL('**/', { timeout: 10000 });
    
    await signOutUser(page);

    // Navigate to sign in page
    await page.goto('/signin');
    
    // Wait a bit to respect rate limiter
    await page.waitForTimeout(2000);
    
    // Now sign in
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Verify we're back on home page
    await page.waitForURL('**/', { timeout: 10000 });
    await expect(page).toHaveURL(/\/$/);  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/signin');
    
    // Try to sign in with invalid credentials
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for error message
    await expect(page.locator('text=/invalid|error|wrong|incorrect/i').first()).toBeVisible({ timeout: 5000 });
  });
});
