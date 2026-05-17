const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir:       './tests',
  timeout:       60_000,
  retries:       1,
  workers:       1,
  fullyParallel: false,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/html', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: false }],
  ],

  use: {
    baseURL:           'https://www.pakwheels.com',
    channel:           'chrome',
    headless:          true,
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/124.0.0.0 Safari/537.36',
    viewport:          { width: 1280, height: 800 },
    locale:            'en-US',
    navigationTimeout: 45_000,
    actionTimeout:     15_000,
    screenshot:        'only-on-failure',
    video:             'retain-on-failure',
    trace:             'retain-on-failure',
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
          ],
        },
      },
    },
  ],
});
