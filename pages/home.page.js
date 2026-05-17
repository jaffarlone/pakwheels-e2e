// pages/home.page.js

const { HOME_LOCATORS: L } = require('../locators/home.locators');

class HomePage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
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

  async isSearchBarVisible() {
    for (const sel of L.SEARCH_BAR) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 3_000 })) return true;
      } catch {}
    }
    return false;
  }

  async hasNavLink(text) {
    try {
      const el = this.page.getByRole('link', { name: new RegExp(text, 'i') }).first();
      return await el.isVisible({ timeout: 5_000 });
    } catch { return false; }
  }

  async hasUsedCarsLink() {
    return this.hasNavLink('used car');
  }

  async hasNewCarsLink() {
    return this.hasNavLink('new car');
  }

  async hasForumsLink() {
    return this.hasNavLink('forum');
  }

  async hasBikeOrAutoPartsLink() {
    const bike = await this.hasNavLink('bike');
    const parts = await this.hasNavLink('part');
    return bike || parts;
  }

  async isLogoVisible() {
    for (const sel of L.LOGO) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 3_000 })) return true;
      } catch {}
    }
    return false;
  }

  async getFeaturedListingsCount() {
    for (const sel of L.FEATURED_LISTINGS) {
      try {
        const count = await this.page.locator(sel).count();
        if (count > 0) return count;
      } catch {}
    }
    return 0;
  }
}

module.exports = { HomePage };
