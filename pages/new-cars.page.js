// pages/new-cars.page.js

const { NEW_CARS_LOCATORS: L } = require('../locators/new-cars.locators');

class NewCarsPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/new-cars/', { waitUntil: 'domcontentloaded' });
  }

  async getTitle() {
    return this.page.title();
  }

  async getUrl() {
    return this.page.url();
  }

  async isBodyLoaded() {
    const len = await this.page.evaluate(() => document.body.innerText.trim().length);
    return len > 100;
  }

  async getBrandCount() {
    for (const sel of L.BRAND_CARDS) {
      try {
        const count = await this.page.locator(sel).count();
        if (count >= 3) return count;
      } catch {}
    }
    return 0;
  }

  async hasPopularBrandVisible() {
    // Suzuki, Toyota, Honda are the most common Pakistani brands
    for (const brand of ['Suzuki', 'Toyota', 'Honda']) {
      try {
        const el = this.page.getByText(brand, { exact: false }).first();
        if (await el.isVisible({ timeout: 3_000 })) return true;
      } catch {}
    }
    return false;
  }

  async isNewCarsHeadingVisible() {
    try {
      const h1 = this.page.locator('h1').first();
      if (await h1.isVisible({ timeout: 3_000 })) return true;
      const h2 = this.page.locator('h2').first();
      if (await h2.isVisible({ timeout: 3_000 })) return true;
    } catch {}
    return false;
  }

  async navigateToSuzuki() {
    for (const sel of L.SUZUKI_LINK) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 3_000 })) {
          await el.click();
          await this.page.waitForLoadState('domcontentloaded');
          return true;
        }
      } catch {}
    }
    return false;
  }
}

module.exports = { NewCarsPage };
