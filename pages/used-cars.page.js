// pages/used-cars.page.js

const { USED_CARS_LOCATORS: L } = require('../locators/used-cars.locators');

class UsedCarsPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/used-cars/search/-/', { waitUntil: 'domcontentloaded' });
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

  async getListingCount() {
    for (const sel of L.LISTING_CARDS) {
      try {
        const count = await this.page.locator(sel).count();
        if (count > 0) return count;
      } catch {}
    }
    return 0;
  }

  async isFilterPanelVisible() {
    for (const sel of L.FILTER_PANEL) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 5_000 })) return true;
      } catch {}
    }
    return false;
  }

  async isSearchResultsHeadingVisible() {
    try {
      for (const sel of L.RESULTS_HEADING) {
        const el = this.page.locator(sel).first();
        const visible = await el.isVisible({ timeout: 3_000 });
        if (visible) return true;
      }
    } catch {}
    return false;
  }

  async searchByCity(city) {
    for (const sel of L.CITY_SELECT) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 3_000 })) {
          await el.selectOption({ label: city });
          return true;
        }
      } catch {}
    }
    return false;
  }

  async getPaginationVisible() {
    for (const sel of L.PAGINATION) {
      try {
        const el = this.page.locator(sel).first();
        if (await el.isVisible({ timeout: 3_000 })) return true;
      } catch {}
    }
    return false;
  }

  async gotoWithMake(make) {
    await this.page.goto(`/used-cars/search/-/make-${make}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });
  }

  async gotoWithParams(params = {}) {
    const query = new URLSearchParams(params).toString();
    await this.page.goto(`/used-cars/search/-/${query ? '?' + query : ''}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });
  }

  async gotoPage(n) {
    await this.page.goto(`/used-cars/search/-/?page=${n}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });
  }

  async getResultsCountText() {
    for (const sel of L.RESULTS_COUNT_TEXT) {
      try {
        const el = this.page.locator(sel).first();
        const text = await el.innerText({ timeout: 3_000 });
        if (/\d/.test(text)) return text.trim();
      } catch {}
    }
    return null;
  }

  async getListingTitles() {
    for (const sel of L.LISTING_TITLES) {
      try {
        const els = this.page.locator(sel);
        const count = await els.count();
        if (count > 0) {
          const titles = [];
          for (let i = 0; i < Math.min(count, 5); i++) {
            titles.push(await els.nth(i).innerText());
          }
          return titles;
        }
      } catch {}
    }
    return [];
  }

  async getListingPrices() {
    for (const sel of L.LISTING_PRICES) {
      try {
        const els = this.page.locator(sel);
        const count = await els.count();
        if (count > 0) {
          const prices = [];
          for (let i = 0; i < Math.min(count, 5); i++) {
            const text = await els.nth(i).innerText();
            if (text.trim().length > 0) prices.push(text.trim());
          }
          if (prices.length > 0) return prices;
        }
      } catch {}
    }
    return [];
  }

  async clickNextPage() {
    for (const sel of L.NEXT_PAGE) {
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

  async hasNoResultsMessage() {
    const bodyText = await this.page.evaluate(() => document.body.innerText.toLowerCase());
    return (
      bodyText.includes('no result') ||
      bodyText.includes('no cars found') ||
      bodyText.includes('no listing') ||
      bodyText.includes('0 result') ||
      bodyText.includes('not found') ||
      bodyText.includes('sorry') ||
      bodyText.includes('0 cars') ||
      bodyText.includes('no ads') ||
      bodyText.includes('no vehicles') ||
      bodyText.includes('nothing found') ||
      /\b0\s+(used\s+)?cars?\b/.test(bodyText)
    );
  }

  async getResponseStatus() {
    let lastStatus = 200;
    this.page.on('response', resp => {
      if (resp.url() === this.page.url()) lastStatus = resp.status();
    });
    return lastStatus;
  }
}

module.exports = { UsedCarsPage };
