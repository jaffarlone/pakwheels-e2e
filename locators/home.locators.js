// locators/home.locators.js
// All CSS / attribute selectors for the PakWheels home page.

const HOME_LOCATORS = {

  // ── Search bar input ──────────────────────────────────────────
  SEARCH_BAR: [
    'input[type="search"]',
    'input[placeholder*="Search"]',
    'input[placeholder*="search"]',
    'input[name*="search"]',
    '.search-input',
    '[class*="search"] input',
    'form input[type="text"]',
  ],

  // ── Site logo ─────────────────────────────────────────────────
  LOGO: [
    'a[href="/"] img',
    '.navbar-brand img',
    'header img',
    'img[alt*="pakwheels" i]',
    'img[alt*="PakWheels" i]',
    '.logo img',
    '[class*="logo"] img',
  ],

  // ── Featured / promoted listing cards ────────────────────────
  FEATURED_LISTINGS: [
    '.car-listing',
    '[class*="listing-card"]',
    '[class*="CarCard"]',
    '[class*="car-card"]',
    '.search-car-card',
    '[class*="featured"]',
    'article',
  ],
};

module.exports = { HOME_LOCATORS };
