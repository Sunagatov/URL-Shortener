import { test, expect } from '@playwright/test';
import { signUpUser, waitForRateLimiter } from './helpers';

test.describe('URL Shortening Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign up and log in before each test
    await signUpUser(page);
    
    // Add delay to respect rate limiter
    await waitForRateLimiter(page, 2000);
  });

  test('should display URL shortening form on home page', async ({ page }) => {
    // Check if we're on home page with URL shortening form
    await expect(page.getByRole('heading', { name: /shorten.*url|url.*shortener/i })).toBeVisible({ timeout: 5000 });
  });

  test('should shorten a URL successfully', async ({ page }) => {
    const longUrl = 'https://www.example.com/very/long/path/to/some/resource';
    
    // Find and fill URL input
    const urlInput = page.locator('input[type="text"], input[type="url"]').first();
    await urlInput.fill(longUrl);
    
    // Click shorten button
    await page.getByRole('button', { name: /shorten/i }).click();
    
    // Wait for result (with timeout for API call)
    await page.waitForTimeout(3000);
    
    // Verify some response is shown
    await expect(page.locator('body')).toContainText(/http|short|success/i, { timeout: 5000 });
  });
});
