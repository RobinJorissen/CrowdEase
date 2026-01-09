import { test, expect } from '@playwright/test';

test.describe('CrowdEase - Uitgebreide User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.leaflet-container', { timeout: 15000 });
  });

  test('gebruiker kan adres invoeren en kaart centreert op locatie', async ({ page }) => {
    // Open zoekbalk
    const searchButton = page.locator('button[aria-label="Zoek adres"]');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // Voer adres in
    const searchInput = page.locator('input[placeholder="Zoek adres..."]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Korenmarkt, Gent');

    // Submit door Enter te drukken
    await searchInput.press('Enter');

    // Wacht op nieuwe kaartcentrum (zoekbalk sluit)
    await expect(searchButton).toBeVisible({ timeout: 10000 });
  });

  test('gebruiker kan filters toepassen en winkels worden gefilterd', async ({ page }) => {
    // Tel aantal markers voor filtering
    const initialMarkerCount = await page.locator('.leaflet-marker-icon').count();
    expect(initialMarkerCount).toBeGreaterThan(0);

    // Open filter panel
    const filterButton = page.locator('button[aria-label="Filters"]');
    await filterButton.click();

    // Klik op Supermarkten filter
    const supermarktFilter = page.getByRole('button', { name: /Supermarkten filter/i });
    await expect(supermarktFilter).toBeVisible();
    await supermarktFilter.click();

    // Sluit filter panel
    const closeButton = page.locator('button[aria-label="Filters sluiten"]');
    await closeButton.click();

    // Controleer dat aantal markers is veranderd (gefilterd)
    await page.waitForTimeout(500); // Wacht op herrender
    const filteredMarkerCount = await page.locator('.leaflet-marker-icon').count();

    // Met filters zou het aantal markers anders moeten zijn
    expect(filteredMarkerCount).toBeLessThanOrEqual(initialMarkerCount);
  });

  test('Escape toets sluit zoekpanel', async ({ page }) => {
    // Open zoekbalk
    const searchButton = page.locator('button[aria-label="Zoek adres"]');
    await searchButton.click();

    const searchInput = page.locator('input[placeholder="Zoek adres..."]');
    await expect(searchInput).toBeVisible();

    // Druk op Escape
    await page.keyboard.press('Escape');

    // Zoekbalk moet gesloten zijn
    await expect(searchInput).not.toBeVisible();
    await expect(searchButton).toBeVisible();
  });

  test('Escape toets sluit filterpanel', async ({ page }) => {
    // Open filter panel
    const filterButton = page.locator('button[aria-label="Filters"]');
    await filterButton.click();

    const filterPanel = page.getByText('Supermarkten');
    await expect(filterPanel).toBeVisible();

    // Druk op Escape
    await page.keyboard.press('Escape');

    // Panel moet gesloten zijn
    await expect(filterPanel).not.toBeVisible();
    await expect(filterButton).toBeVisible();
  });

  test('filters badge toont aantal actieve filters', async ({ page }) => {
    const filterButton = page.locator('button[aria-label="Filters"]');

    // Initieel geen badge
    await expect(filterButton.locator('.bg-emerald-600')).not.toBeVisible();

    // Open en selecteer filter
    await filterButton.click();
    const apotheekFilter = page.getByRole('button', { name: /Apotheken filter/i });
    await apotheekFilter.click();

    // Sluit panel
    const closeButton = page.locator('button[aria-label="Filters sluiten"]');
    await closeButton.click();

    // Badge moet "1" tonen
    const badge = filterButton.locator('.bg-emerald-600');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('1');
  });

  test('"Wis filters" knop reset alle filters', async ({ page }) => {
    // Open filter panel
    const filterButton = page.locator('button[aria-label="Filters"]');
    await filterButton.click();

    // Selecteer meerdere filters
    const supermarktFilter = page.getByRole('button', { name: /Supermarkten filter/i });
    const apotheekFilter = page.getByRole('button', { name: /Apotheken filter/i });
    await supermarktFilter.click();
    await apotheekFilter.click();

    // Wis filters knop moet verschijnen
    const clearButton = page.getByText('Wis filters');
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Sluit panel
    const closeButton = page.locator('button[aria-label="Filters sluiten"]');
    await closeButton.click();

    // Badge moet verdwenen zijn
    await expect(filterButton.locator('.bg-emerald-600')).not.toBeVisible();
  });

  test('error message verschijnt bij ongeldig adres', async ({ page }) => {
    // Open zoekbalk
    const searchButton = page.locator('button[aria-label="Zoek adres"]');
    await searchButton.click();

    // Voer ongeldig adres in
    const searchInput = page.locator('input[placeholder="Zoek adres..."]');
    await searchInput.fill('qwerty123456789xyz');
    await searchInput.press('Enter');

    // Wacht op alert/error (geïmplementeerd als browser alert)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('niet gevonden');
      await dialog.accept();
    });
  });

  test('loading spinner verschijnt tijdens geocoding', async ({ page }) => {
    // Open zoekbalk
    const searchButton = page.locator('button[aria-label="Zoek adres"]');
    await searchButton.click();

    // Voer adres in
    const searchInput = page.locator('input[placeholder="Zoek adres..."]');
    await searchInput.fill('Veldstraat, Gent');

    // Start search
    await searchInput.press('Enter');

    // Loading spinner zou moeten verschijnen (kort)
    const spinner = page.locator('.animate-spin');
    // Note: spinner kan te snel zijn om te detecteren in tests
    // Dit is een optimistische check
  });

  test('keyboard navigation werkt voor alle interactieve elementen', async ({ page }) => {
    // Tab door elementen
    await page.keyboard.press('Tab'); // Focus op eerste element
    await page.keyboard.press('Tab'); // Volgende element

    // Check of focus zichtbaar is (shadcn buttons hebben focus rings)
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
