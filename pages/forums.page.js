// pages/forums.page.js

class ForumsPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/forums/', { waitUntil: 'domcontentloaded' });
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

  async getCategoryCount() {
    const selectors = [
      '[class*="forum-category"]',
      '[class*="ForumCategory"]',
      '.forum-list li',
      '[class*="category"]',
      '.forum-block',
      'section.forum',
      'tbody tr',
    ];
    for (const sel of selectors) {
      try {
        const count = await this.page.locator(sel).count();
        if (count >= 2) return count;
      } catch {}
    }
    return 0;
  }

  async isForumHeadingVisible() {
    try {
      const h1 = this.page.locator('h1').first();
      if (await h1.isVisible({ timeout: 3_000 })) return true;
      const h2 = this.page.locator('h2').first();
      if (await h2.isVisible({ timeout: 3_000 })) return true;
    } catch {}
    return false;
  }

  async hasThreadsOrTopics() {
    const selectors = [
      '[class*="thread"]',
      '[class*="topic"]',
      '[class*="post"]',
      'tr.has-thread',
      '[class*="discussion"]',
    ];
    for (const sel of selectors) {
      try {
        const count = await this.page.locator(sel).count();
        if (count > 0) return true;
      } catch {}
    }
    return false;
  }

  async isForumNavVisible() {
    // Should have a link back to forums or breadcrumb
    try {
      const el = this.page.getByRole('link', { name: /forum/i }).first();
      return await el.isVisible({ timeout: 3_000 });
    } catch { return false; }
  }
}

module.exports = { ForumsPage };
