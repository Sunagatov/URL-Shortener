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
    
    const created = page.waitForResponse(response =>
      response.request().method() === 'POST' && new URL(response.url()).pathname === '/api/v1/urls'
    );
    await page.getByRole('button', { name: /shorten/i }).click();
    const response = await created;
    expect(response.ok()).toBeTruthy();
    const { shortUrl } = await response.json();
    await expect(page.getByRole('link', { name: shortUrl, exact: true })).toBeVisible();

    // Check the saved redirect without following it to an external website.
    const redirect = await page.request.get(shortUrl, { maxRedirects: 0 });
    expect(redirect.status()).toBe(302);
    expect(redirect.headers().location).toBe(longUrl);
  });
});
