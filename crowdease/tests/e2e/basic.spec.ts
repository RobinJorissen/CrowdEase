import { test, expect } from '@playwright/test';

test.describe('CrowdEase E2E', () => {
  test('should load homepage with map', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check if page loaded
    await expect(page).toHaveTitle(/CrowdEase/);

    // Wait for map container to be visible
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 15000 });
  });

  test('should expand search when clicking search icon', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Click search icon
    const searchButton = page.locator('button[aria-label="Zoek adres"]');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // Check if input field appears
    const searchInput = page.locator('input[placeholder="Zoek adres..."]');
    await expect(searchInput).toBeVisible();
  });

  test('should show filter panel when clicking filter icon', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });

    // Click filter icon
    const filterButton = page.locator('button[aria-label="Filters"]');
    await expect(filterButton).toBeVisible();
    await filterButton.click();

    // Check if filter panel appears
    const filterPanel = page.getByText('Supermarkten');
    await expect(filterPanel).toBeVisible();
  });
});
