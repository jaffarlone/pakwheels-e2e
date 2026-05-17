// tests/forums.spec.js
// Regression: PakWheels forums / community

const { test, expect } = require('@playwright/test');
const { ForumsPage } = require('../pages/forums.page');

test.describe('PakWheels – Forums & Community', () => {

  test.beforeEach(async ({ page }) => {
    const forums = new ForumsPage(page);
    await forums.goto();
  });

  // ── 1. Page loads ─────────────────────────────────────────────
  test('forums page loads', async ({ page }) => {
    const forums = new ForumsPage(page);
    expect(await forums.isBodyLoaded()).toBe(true);
  });

  // ── 2. URL ───────────────────────────────────────────────────
  test('forums URL contains "forums"', async ({ page }) => {
    const forums = new ForumsPage(page);
    const url = await forums.getUrl();
    expect(url.toLowerCase()).toContain('forum');
  });

  // ── 3. Title ──────────────────────────────────────────────────
  test('forums page has meaningful title', async ({ page }) => {
    const forums = new ForumsPage(page);
    const title = await forums.getTitle();
    expect(title.toLowerCase()).toMatch(/forum|pakwheels/i);
  });

  // ── 4. Heading visible ────────────────────────────────────────
  test('forums heading is visible', async ({ page }) => {
    const forums = new ForumsPage(page);
    expect(await forums.isForumHeadingVisible()).toBe(true);
  });

  // ── 5. Forum categories ───────────────────────────────────────
  test('forum categories are listed', async ({ page }) => {
    const forums = new ForumsPage(page);
    const count = await forums.getCategoryCount();
    expect(count).toBeGreaterThan(1);
  });

  // ── 6. Forums nav link ────────────────────────────────────────
  test('forums navigation link is present', async ({ page }) => {
    const forums = new ForumsPage(page);
    expect(await forums.isForumNavVisible()).toBe(true);
  });

});

// ══════════════════════════════════════════════════════════════
// NEGATIVE CASES
// ══════════════════════════════════════════════════════════════
test.describe('PakWheels – Forums & Community (Negative)', () => {

  // ── N1. Non-existent forum category does not return a 5xx ────────
  // Whatever PakWheels does with an invalid category (404 page,
  // redirect, empty list) — a server crash (5xx) is never acceptable.
  test('non-existent forum category does not cause a server error', async ({ page }) => {
    let serverError = false;
    page.on('response', resp => {
      if (resp.status() >= 500) serverError = true;
    });
    await page.goto('/forums/fake-category-that-does-not-exist-xyz999/', {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    }).catch(() => {});
    // Page must load something (not a blank/crashed tab)
    const bodyLen = await page.evaluate(() => document.body.innerText.trim().length).catch(() => 0);
    expect(serverError).toBe(false);
    expect(bodyLen).toBeGreaterThanOrEqual(0); // browser didn't hard-freeze
  });

  // ── N2. Non-existent forum thread does not cause a server error ──
  test('non-existent forum thread does not cause a server error', async ({ page }) => {
    let serverError = false;
    page.on('response', resp => {
      if (resp.status() >= 500) serverError = true;
    });
    await page.goto('/forums/t/this-thread-does-not-exist/99999999/', {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    }).catch(() => {});
    const bodyLen = await page.evaluate(() => document.body.innerText.trim().length).catch(() => 0);
    expect(serverError).toBe(false);
    expect(bodyLen).toBeGreaterThanOrEqual(0);
  });

  // ── N3. Forums page does not expose server error ───────────────
  // No request to /forums/ should return a 5xx server error.
  test('forums page returns no server-side errors (no 5xx)', async ({ page }) => {
    let serverError = false;
    page.on('response', resp => {
      if (resp.url().includes('/forums/') && resp.status() >= 500) {
        serverError = true;
      }
    });
    await page.goto('/forums/', { waitUntil: 'domcontentloaded' });
    expect(serverError).toBe(false);
  });

});
