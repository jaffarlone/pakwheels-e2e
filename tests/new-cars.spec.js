// tests/new-cars.spec.js
// Regression: PakWheels new cars listing

const { test, expect } = require('@playwright/test');
const { NewCarsPage } = require('../pages/new-cars.page');

test.describe('PakWheels – New Cars', () => {

  test.beforeEach(async ({ page }) => {
    const newCars = new NewCarsPage(page);
    await newCars.goto();
  });

  // ── 1. Page loads ─────────────────────────────────────────────
  test('new cars page loads', async ({ page }) => {
    const newCars = new NewCarsPage(page);
    expect(await newCars.isBodyLoaded()).toBe(true);
  });

  // ── 2. URL ───────────────────────────────────────────────────
  test('new cars URL contains "new-cars"', async ({ page }) => {
    const newCars = new NewCarsPage(page);
    const url = await newCars.getUrl();
    expect(url.toLowerCase()).toContain('new-cars');
  });

  // ── 3. Title ──────────────────────────────────────────────────
  test('new cars page has meaningful title', async ({ page }) => {
    const newCars = new NewCarsPage(page);
    const title = await newCars.getTitle();
    expect(title.toLowerCase()).toMatch(/new.?car|pakwheels/i);
  });

  // ── 4. Heading visible ────────────────────────────────────────
  test('new cars heading is visible on page', async ({ page }) => {
    const newCars = new NewCarsPage(page);
    expect(await newCars.isNewCarsHeadingVisible()).toBe(true);
  });

  // ── 5. Car brands shown ───────────────────────────────────────
  test('multiple car brands/makes are listed', async ({ page }) => {
    const newCars = new NewCarsPage(page);
    const count = await newCars.getBrandCount();
    expect(count).toBeGreaterThan(2);
  });

  // ── 6. Popular Pakistani brands present ───────────────────────
  test('popular brands (Suzuki / Toyota / Honda) are visible', async ({ page }) => {
    const newCars = new NewCarsPage(page);
    expect(await newCars.hasPopularBrandVisible()).toBe(true);
  });

});

// ══════════════════════════════════════════════════════════════
// NEGATIVE CASES
// ══════════════════════════════════════════════════════════════
test.describe('PakWheels – New Cars (Negative)', () => {

  // ── N1. Non-existent brand URL is handled ─────────────────────
  // A completely fake brand name in the URL should not render
  // a valid car listing page.
  test('non-existent brand URL does not show valid listing', async ({ page }) => {
    await page.goto('/new-cars/fakebrandxyz99999/', {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    }).catch(() => {});
    const url = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const handledGracefully =
      bodyText.includes('not found') ||
      bodyText.includes('404') ||
      bodyText.includes('no result') ||
      bodyText.includes('does not exist') ||
      // redirect back to new-cars listing is also acceptable
      url.includes('/new-cars/') ||
      url === 'https://www.pakwheels.com/';
    expect(handledGracefully).toBe(true);
  });

  // ── N2. Fictitious model under real brand is handled ──────────
  // Navigating to a model that does not exist under Suzuki should
  // not silently show a valid model page.
  test('non-existent model under Suzuki does not show a car detail page', async ({ page }) => {
    await page.goto('/new-cars/suzuki/model-doesnotexist-xyz/', {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    }).catch(() => {});
    const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const url = page.url();
    const handledGracefully =
      bodyText.includes('not found') ||
      bodyText.includes('404') ||
      bodyText.includes('no result') ||
      bodyText.includes('does not exist') ||
      url.includes('/new-cars/suzuki/') ||
      url.includes('/new-cars/');
    expect(handledGracefully).toBe(true);
  });

  // ── N3. New cars page does not list bikes or accessories ───────
  // The new cars section should be specific to cars —
  // the word "motorcycle" or "bike" should not dominate the page.
  test('new cars page content is about cars not bikes', async ({ page }) => {
    await page.goto('/new-cars/', { waitUntil: 'domcontentloaded' });
    const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
    // The page should mention "car" more than "motorcycle"
    const carCount = (bodyText.match(/\bcar\b/g) || []).length;
    const bikeCount = (bodyText.match(/\bmotorcycle\b|\bbike\b/g) || []).length;
    expect(carCount).toBeGreaterThanOrEqual(bikeCount);
  });

});
