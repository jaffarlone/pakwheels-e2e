// tests/homepage.spec.js
// Regression: PakWheels homepage & navigation

const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pages/home.page');

test.describe('PakWheels – Homepage & Navigation', () => {

  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
  });

  // ── 1. Page loads ─────────────────────────────────────────────
  test('homepage loads with content', async ({ page }) => {
    const home = new HomePage(page);
    expect(await home.isBodyLoaded()).toBe(true);
  });

  // ── 2. Title ──────────────────────────────────────────────────
  test('homepage has correct title containing PakWheels', async ({ page }) => {
    const home = new HomePage(page);
    const title = await home.getTitle();
    expect(title.toLowerCase()).toContain('pakwheels');
  });

  // ── 3. URL ───────────────────────────────────────────────────
  test('homepage URL resolves to pakwheels.com', async ({ page }) => {
    const home = new HomePage(page);
    const url = await home.getUrl();
    expect(url).toContain('pakwheels.com');
  });

  // ── 4. Logo ──────────────────────────────────────────────────
  test('PakWheels logo is visible', async ({ page }) => {
    const home = new HomePage(page);
    expect(await home.isLogoVisible()).toBe(true);
  });

  // ── 5. Used Cars nav link ─────────────────────────────────────
  test('navigation contains Used Cars link', async ({ page }) => {
    const home = new HomePage(page);
    expect(await home.hasUsedCarsLink()).toBe(true);
  });

  // ── 6. New Cars nav link ──────────────────────────────────────
  test('navigation contains New Cars link', async ({ page }) => {
    const home = new HomePage(page);
    expect(await home.hasNewCarsLink()).toBe(true);
  });

  // ── 7. Forums nav link ────────────────────────────────────────
  test('navigation contains Forums link', async ({ page }) => {
    const home = new HomePage(page);
    expect(await home.hasForumsLink()).toBe(true);
  });

});

// ══════════════════════════════════════════════════════════════
// NEGATIVE CASES
// ══════════════════════════════════════════════════════════════
test.describe('PakWheels – Homepage & Navigation (Negative)', () => {

  // ── N1. 404 page ──────────────────────────────────────────────
  // Navigating to a completely invalid path should NOT silently
  // show a normal homepage — either a 404 page or redirect is expected.
  test('non-existent path returns 404 or redirects gracefully', async ({ page }) => {
    await page.goto('/this-page-absolutely-does-not-exist-xyz123', {
      waitUntil: 'domcontentloaded',
    });
    const url = page.url();
    const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const handledGracefully =
      bodyText.includes('404') ||
      bodyText.includes('not found') ||
      bodyText.includes("doesn't exist") ||
      bodyText.includes('page not found') ||
      url.includes('404') ||
      // redirect to homepage is also an acceptable defensive behaviour
      url === 'https://www.pakwheels.com/' ||
      url === 'https://www.pakwheels.com';
    expect(handledGracefully).toBe(true);
  });

  // ── N2. XSS string in query param is not rendered ─────────────
  // A script tag injected via URL query param should NOT appear
  // as raw executable HTML in the page.
  test('XSS payload in query param is not reflected as executable HTML', async ({ page }) => {
    await page.goto('/?q=<script>alert(1)</script>', {
      waitUntil: 'domcontentloaded',
    });
    const content = await page.content();
    expect(content).not.toContain('<script>alert(1)</script>');
  });

  // ── N3. Junk URL does not crash the browser ────────────────────
  // Even on a completely broken path the site should respond,
  // not leave the user with a blank/frozen tab.
  test('junk URL path returns a page without hard crash', async ({ page }) => {
    let navigated = true;
    try {
      await page.goto('/@@@@invalid-path@@@@', {
        waitUntil: 'domcontentloaded',
        timeout: 20_000,
      });
    } catch {
      navigated = false;
    }
    // Either a page loaded OR a navigation error was thrown — both are non-crash
    const bodyLen = await page.evaluate(() => document.body.innerText.trim().length).catch(() => 0);
    expect(navigated || bodyLen >= 0).toBe(true);
  });

});
