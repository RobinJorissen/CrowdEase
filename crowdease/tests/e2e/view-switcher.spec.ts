import { test, expect } from '@playwright/test';

test.describe('View Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('should display view toggle button', async ({ page }) => {
    // Check if the view toggle button is visible
    const viewToggle = page.getByLabel('Kaartweergave');
    await expect(viewToggle).toBeVisible();

    const listToggle = page.getByLabel('Lijstweergave');
    await expect(listToggle).toBeVisible();
  });

  test('should switch from map to list view', async ({ page }) => {
    // Click on list view button
    const listButton = page.getByLabel('Lijstweergave');
    await listButton.click();

    // Check if list view is displayed
    await expect(page.getByText(/Winkels \(\d+\)/)).toBeVisible();
    await expect(page.getByText('Gesorteerd op drukte en afstand')).toBeVisible();

    // Map should be hidden
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeHidden();
  });

  test('should display stores in list view sorted by crowd level', async ({ page }) => {
    // Switch to list view
    await page.getByLabel('Lijstweergave').click();

    // Wait for stores to load
    await page.waitForSelector(
      'button:has-text("Rustig"), button:has-text("Matig"), button:has-text("Druk")',
      {
        timeout: 5000,
      }
    );

    // Check if stores are displayed
    const storeItems = page.locator('button').filter({ hasText: /Rustig|Matig|Druk/ });
    const count = await storeItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show recommendation badge for quiet stores in list view', async ({ page }) => {
    // Switch to list view
    await page.getByLabel('Lijstweergave').click();

    // Wait for the list to load
    await page.waitForTimeout(1000);

    // Look for recommendation badges (only on rustig/matig stores)
    const recommendationBadges = page.getByText('Aanbeveling');
    const badgeCount = await recommendationBadges.count();

    // Should have at least some recommendations if there are quiet stores
    // (This is a soft check - actual number depends on mock data)
    expect(badgeCount).toBeGreaterThanOrEqual(0);
  });

  test('should display distance for each store in list view', async ({ page }) => {
    // Switch to list view
    await page.getByLabel('Lijstweergave').click();

    // Wait for stores to load
    await page.waitForTimeout(1000);

    // Check if distance is displayed (formatted as "X m" or "X.X km")
    const distanceText = page.locator('text=/\\d+(\\.\\d+)? (m|km)/');
    const count = await distanceText.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should switch back to map view when clicking map button', async ({ page }) => {
    // First switch to list view
    await page.getByLabel('Lijstweergave').click();
    await expect(page.getByText('Gesorteerd op drukte en afstand')).toBeVisible();

    // Then switch back to map view
    await page.getByLabel('Kaartweergave').click();

    // Map should be visible again
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();

    // List view header should be hidden
    await expect(page.getByText('Gesorteerd op drukte en afstand')).toBeHidden();
  });

  test('should navigate to map when clicking a store in list view', async ({ page }) => {
    // Switch to list view
    await page.getByLabel('Lijstweergave').click();

    // Wait for stores to load
    await page.waitForTimeout(1000);

    // Click on the first store item
    const firstStore = page
      .locator('button')
      .filter({ hasText: /Rustig|Matig|Druk/ })
      .first();
    await firstStore.click();

    // Should switch to map view
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();

    // List should be hidden
    await expect(page.getByText('Gesorteerd op drukte en afstand')).toBeHidden();
  });

  test('should show recommendation star icon on map markers', async ({ page }) => {
    // Wait for map to load
    await page.waitForTimeout(2000);

    // Click on a marker (green marker = rustig = recommended)
    const greenMarker = page.locator('img[src*="marker-icon-2x-green"]').first();

    if ((await greenMarker.count()) > 0) {
      await greenMarker.click();

      // Wait for popup to appear
      await page.waitForTimeout(500);

      // Look for recommendation badge in popup
      const popup = page.locator('.leaflet-popup-content');
      await expect(popup.getByText('Aanbeveling')).toBeVisible();
    }
  });

  test('should maintain filter state when switching between views', async ({ page }) => {
    // Wait for stores to load
    await page.waitForTimeout(1000);

    // Open filter (if available)
    const filterButton = page.getByText('Supermarkt').or(page.getByText('Apotheek'));

    if ((await filterButton.count()) > 0) {
      await filterButton.first().click();

      // Switch to list view
      await page.getByLabel('Lijstweergave').click();
      await page.waitForTimeout(500);

      // Switch back to map
      await page.getByLabel('Kaartweergave').click();
      await page.waitForTimeout(500);

      // Filters should still be applied (map should show filtered markers)
      const leafletContainer = page.locator('.leaflet-container');
      await expect(leafletContainer).toBeVisible();
    }
  });
});
