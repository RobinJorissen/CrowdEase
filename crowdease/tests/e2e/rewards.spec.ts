import { test, expect } from '@playwright/test';

test.describe('Check-in & Rewards System', () => {
  test('should display points badge', async ({ page }) => {
    await page.goto('/');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Points badge should be visible
    const pointsBadge = page.locator('button:has-text("0")').first();
    await expect(pointsBadge).toBeVisible({ timeout: 5000 });
  });

  test('should open rewards screen when clicking points badge', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Click points badge
    const pointsBadge = page.locator('button').filter({ hasText: /^\d+$/ }).first();
    await pointsBadge.click();

    // Rewards screen should open
    await expect(page.locator('text=Bonussen')).toBeVisible();
    await expect(page.locator('text=Je punten:')).toBeVisible();

    // Should show reward cards
    await expect(page.locator('text=korting')).toBeVisible();
  });

  test('should show check-in button in store marker popup', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Wait for markers to load
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });

    // Click first marker
    const marker = page.locator('.leaflet-marker-icon').first();
    await marker.click();

    // Popup should show check-in button
    await expect(page.locator('text=Check-in')).toBeVisible({ timeout: 3000 });
  });

  test('should close rewards screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Open rewards
    const pointsBadge = page.locator('button').filter({ hasText: /^\d+$/ }).first();
    await pointsBadge.click();
    await expect(page.locator('text=Bonussen')).toBeVisible();

    // Close rewards
    await page.locator('button').filter({ hasText: '' }).last().click();
    await expect(page.locator('text=Bonussen')).not.toBeVisible();
  });
});
