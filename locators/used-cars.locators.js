// locators/used-cars.locators.js
// All CSS / attribute selectors for the Used Cars search pages.
// Import this file in both the page object and the spec file instead of
// scattering selector strings across multiple files.

const USED_CARS_LOCATORS = {

  // ── Listing cards ─────────────────────────────────────────────
  // Tried in order; the first selector that returns > 0 elements is used.
  LISTING_CARDS: [
    '.search-car-card',
    '[class*="listing-card"]',
    '[class*="CarCard"]',
    '[class*="car-card"]',
    '[class*="used-car"]',
    'li.car-item',
    '.car-listing',
    'article[class*="car"]',
  ],

  // ── Filter / sidebar panel ────────────────────────────────────
  FILTER_PANEL: [
    '[class*="filter"]',
    'aside',
    '[class*="sidebar"]',
    'form[class*="search"]',
    '[data-section="filters"]',
  ],

  // ── Results heading or count indicator ───────────────────────
  RESULTS_HEADING: [
    'h1',
    'h2',
    '[class*="results"]',
    '[class*="total"]',
    '[class*="count"]',
  ],

  // ── City filter dropdown ──────────────────────────────────────
  CITY_SELECT: [
    'select[name*="city"]',
    'select[id*="city"]',
    '[class*="city"] select',
    'select[aria-label*="city" i]',
  ],

  // ── City filter control (broader — used to detect presence) ──
  CITY_FILTER_CONTROL: [
    'select[name*="city"]',
    'select[id*="city"]',
    '[class*="city"] select',
    '[aria-label*="city" i]',
    '[placeholder*="city" i]',
  ],

  // ── Pagination controls ───────────────────────────────────────
  PAGINATION: [
    '[class*="pagination"]',
    'nav[aria-label*="page" i]',
    '.page-numbers',
    '[class*="pager"]',
  ],

  // ── Results count text (must contain a digit to be valid) ────
  RESULTS_COUNT_TEXT: [
    '[class*="result"] [class*="count"]',
    '[class*="total"]',
    '[class*="count"]',
    'h1',
    'h2',
  ],

  // ── Listing title elements ────────────────────────────────────
  LISTING_TITLES: [
    '.search-car-card h2',
    '.search-car-card h3',
    '[class*="listing-card"] h2',
    '[class*="listing-card"] h3',
    '[class*="car-card"] h2',
    '[class*="car-card"] h3',
    '.car-name',
    '[class*="car-title"]',
  ],

  // ── Listing price elements ────────────────────────────────────
  LISTING_PRICES: [
    '[class*="price"]',
    '[class*="Price"]',
    '.car-price',
    '[data-price]',
  ],

  // ── Next-page link ────────────────────────────────────────────
  NEXT_PAGE: [
    'a[rel="next"]',
    '[class*="pagination"] a:last-child',
    '[class*="next"]',
    'a[aria-label*="next" i]',
  ],
};

module.exports = { USED_CARS_LOCATORS };
