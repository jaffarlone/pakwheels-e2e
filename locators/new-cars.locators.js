// locators/new-cars.locators.js
// All CSS / attribute selectors for the PakWheels new cars pages.

const NEW_CARS_LOCATORS = {

  // ── Brand / make cards or links ───────────────────────────────
  BRAND_CARDS: [
    '[class*="brand"]',
    '[class*="make"]',
    '[class*="Brand"]',
    '.brand-card',
    '[class*="manufacturer"]',
    'a[href*="/new-cars/"]',
  ],

  // ── Suzuki navigation link ────────────────────────────────────
  SUZUKI_LINK: [
    'a[href*="suzuki" i]',
    'a:has-text("Suzuki")',
  ],
};

module.exports = { NEW_CARS_LOCATORS };
