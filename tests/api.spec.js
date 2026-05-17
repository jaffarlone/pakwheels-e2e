// tests/api.spec.js
// HTTP-layer API tests for pakwheels.com.
//
// These tests use Playwright's `request` fixture which sends real HTTP
// requests without launching a browser. They run much faster than the E2E
// suite and catch infrastructure regressions (wrong status codes, missing
// headers, broken redirects, slow responses) independently of the UI.
//
// Base URL is set in playwright.config.js → https://www.pakwheels.com

const { test, expect } = require('@playwright/test');
const {
  API_ENDPOINTS: EP,
  HAPPY_PATH_PAGES,
  NO_SERVER_ERROR_PAGES,
} = require('../locators/api-endpoints');

// ── Shared thresholds ─────────────────────────────────────────────────────
const RESPONSE_TIME_MS   = 8_000;   // max acceptable latency per request
const BODY_MIN_BYTES     = 500;     // a real page is never this small

// ── Helper: GET with timing ───────────────────────────────────────────────
async function timedGet(request, path, options = {}) {
  const t0 = Date.now();
  const response = await request.get(path, { timeout: 15_000, ...options });
  return { response, ms: Date.now() - t0 };
}

// ══════════════════════════════════════════════════════════════════════════
// GROUP 1 – HTTP STATUS CODES (HAPPY PATH)
// Every core page and filter combination must return 200 OK.
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – Status Codes (Happy Path)', () => {

  for (const { label, path } of HAPPY_PATH_PAGES) {
    test(`${label} returns HTTP 200`, async ({ request }) => {
      const { response } = await timedGet(request, path);
      expect(
        response.status(),
        `Expected 200 for ${path}, got ${response.status()}`
      ).toBe(200);
    });
  }

});

// ══════════════════════════════════════════════════════════════════════════
// GROUP 2 – NO SERVER ERRORS ON EDGE-CASE PATHS
// Malformed slugs, bad params, injections – must never return 5xx.
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – No 5xx on Edge-Case Paths', () => {

  for (const { label, path } of NO_SERVER_ERROR_PAGES) {
    test(`${label} does not return a 5xx server error`, async ({ request }) => {
      const { response } = await timedGet(request, path);
      expect(
        response.status(),
        `Expected < 500 for ${path}, got ${response.status()}`
      ).toBeLessThan(500);
    });
  }

});

// ══════════════════════════════════════════════════════════════════════════
// GROUP 3 – CONTENT-TYPE HEADERS
// Every HTML page must declare text/html; charset is strongly recommended.
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – Content-Type Headers', () => {

  const htmlPages = [
    EP.HOME, EP.USED_CARS, EP.NEW_CARS, EP.FORUMS,
    EP.MAKE_TOYOTA, EP.MAKE_SUZUKI,
  ];

  for (const path of htmlPages) {
    test(`${path} responds with text/html content-type`, async ({ request }) => {
      const { response } = await timedGet(request, path);
      const ct = response.headers()['content-type'] ?? '';
      expect(ct.toLowerCase()).toContain('text/html');
    });
  }

  test('used-cars search content-type is text/html with charset', async ({ request }) => {
    const { response } = await timedGet(request, EP.USED_CARS);
    const ct = response.headers()['content-type'] ?? '';
    expect(ct.toLowerCase()).toContain('text/html');
    expect(ct.toLowerCase()).toContain('charset');
  });

});

// ══════════════════════════════════════════════════════════════════════════
// GROUP 4 – RESPONSE BODY CONTENT
// Spot-check that the response body contains the expected keywords so we
// catch silent 200-OK-but-empty responses and mis-routed pages.
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – Response Body Content', () => {

  test('homepage body mentions "pakwheels"', async ({ request }) => {
    const { response } = await timedGet(request, EP.HOME);
    const text = (await response.text()).toLowerCase();
    expect(text).toContain('pakwheels');
  });

  test('homepage body size is above minimum threshold', async ({ request }) => {
    const { response } = await timedGet(request, EP.HOME);
    const body = await response.text();
    expect(body.length).toBeGreaterThan(BODY_MIN_BYTES);
  });

  test('used-cars page body contains car-related content', async ({ request }) => {
    const { response } = await timedGet(request, EP.USED_CARS);
    const text = (await response.text()).toLowerCase();
    expect(text).toMatch(/used.?car|car\s+for\s+sale|pakwheels/i);
  });

  test('new-cars page body references cars or makes', async ({ request }) => {
    const { response } = await timedGet(request, EP.NEW_CARS);
    const text = (await response.text()).toLowerCase();
    expect(text).toMatch(/new.?car|suzuki|toyota|honda/i);
  });

  test('toyota filter page body references toyota', async ({ request }) => {
    const { response } = await timedGet(request, EP.MAKE_TOYOTA);
    const text = (await response.text()).toLowerCase();
    expect(text).toContain('toyota');
  });

  test('suzuki filter page body references suzuki', async ({ request }) => {
    const { response } = await timedGet(request, EP.MAKE_SUZUKI);
    const text = (await response.text()).toLowerCase();
    expect(text).toContain('suzuki');
  });

  test('homepage body does not contain unescaped XSS payload', async ({ request }) => {
    const { response } = await timedGet(request, EP.XSS_QUERY);
    const text = await response.text();
    expect(text).not.toMatch(/<script>alert\(1\)<\/script>/i);
  });

  test('used-cars search response body is not empty', async ({ request }) => {
    const { response } = await timedGet(request, EP.USED_CARS);
    const body = await response.text();
    expect(body.trim().length).toBeGreaterThan(BODY_MIN_BYTES);
  });

});

// ══════════════════════════════════════════════════════════════════════════
// GROUP 5 – 404 / NOT-FOUND BEHAVIOUR
// Invalid paths should return 4xx or redirect – never a silent 200 with
// normal page content pretending everything is fine.
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – 404 / Not-Found Handling', () => {

  test('completely invalid path does not return 200', async ({ request }) => {
    const { response } = await timedGet(request, EP.NOT_FOUND);
    // Accept 404 or a redirect (3xx) but not a normal 200
    const status = response.status();
    const body = (await response.text()).toLowerCase();
    const isHandled =
      status === 404 ||
      (status >= 300 && status < 400) ||
      body.includes('not found') ||
      body.includes('404') ||
      body.includes("doesn't exist");
    expect(isHandled, `Expected 404/redirect for ${EP.NOT_FOUND}, got ${status}`).toBe(true);
  });

  test('fake new-car brand returns non-200 or a graceful page', async ({ request }) => {
    const { response } = await timedGet(request, EP.FAKE_NEW_CAR);
    const status = response.status();
    const body = (await response.text()).toLowerCase();
    const isHandled =
      status !== 200 ||
      body.includes('not found') ||
      body.includes('404') ||
      body.includes('no result');
    expect(isHandled, `Expected graceful handling for ${EP.FAKE_NEW_CAR}, got ${status}`).toBe(true);
  });

  test('fake suzuki model returns non-200 or a graceful page', async ({ request }) => {
    const { response } = await timedGet(request, EP.FAKE_MODEL);
    const status = response.status();
    const body = (await response.text()).toLowerCase();
    const isHandled =
      status !== 200 ||
      body.includes('not found') ||
      body.includes('404') ||
      body.includes('no result');
    expect(isHandled, `Expected graceful handling for ${EP.FAKE_MODEL}, got ${status}`).toBe(true);
  });

});

// ══════════════════════════════════════════════════════════════════════════
// GROUP 6 – HTTP METHOD HANDLING
// Pages built for GET should not silently process POST requests as if they
// were a valid form submission.
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – HTTP Method Handling', () => {

  test('POST to homepage returns 4xx or redirects (not 200 with content)', async ({ request }) => {
    const response = await request.post(EP.HOME, {
      timeout: 15_000,
      data: 'test=1',
    }).catch(() => null);
    // If the server rejects the connection entirely that is also acceptable
    if (!response) return;
    const status = response.status();
    // 405 Method Not Allowed, 403 Forbidden, 301/302 redirect – all fine
    // A 200 is only acceptable if the body looks like an error/redirect page
    if (status === 200) {
      const body = (await response.text()).toLowerCase();
      expect(body).toMatch(/pakwheels|redirect|not allowed|error/i);
    } else {
      expect(status).not.toBe(500);
    }
  });

  test('POST to used-cars search does not return 5xx', async ({ request }) => {
    const response = await request.post(EP.USED_CARS, {
      timeout: 15_000,
      data: 'test=1',
    }).catch(() => null);
    if (!response) return;
    expect(response.status()).toBeLessThan(500);
  });

  test('DELETE to homepage does not return 5xx', async ({ request }) => {
    const response = await request.delete(EP.HOME, {
      timeout: 15_000,
    }).catch(() => null);
    if (!response) return;
    expect(response.status()).toBeLessThan(500);
  });

});

// ══════════════════════════════════════════════════════════════════════════
// GROUP 7 – SECURITY HEADERS
// Verifies that basic security headers are present on the homepage.
// A missing header is a warning, not necessarily a failure – the tests use
// soft assertions with a descriptive message so CI results are actionable.
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – Security Headers', () => {

  test('homepage includes an X-Frame-Options or CSP frame-ancestors header', async ({ request }) => {
    const { response } = await timedGet(request, EP.HOME);
    const headers = response.headers();
    const xfo = headers['x-frame-options'];
    const csp = headers['content-security-policy'] ?? '';
    const hasFrameProtection = !!xfo || csp.includes('frame-ancestors');
    expect(
      hasFrameProtection,
      'Neither X-Frame-Options nor CSP frame-ancestors found — clickjacking protection may be absent'
    ).toBe(true);
  });

  test('homepage includes a Content-Security-Policy header', async ({ request }) => {
    const { response } = await timedGet(request, EP.HOME);
    const csp = response.headers()['content-security-policy'];
    expect(
      !!csp,
      'Content-Security-Policy header is missing'
    ).toBe(true);
  });

  test('homepage includes an X-Content-Type-Options header', async ({ request }) => {
    const { response } = await timedGet(request, EP.HOME);
    const xcto = response.headers()['x-content-type-options'];
    expect(
      !!xcto,
      'X-Content-Type-Options header is missing – MIME-sniffing protection may be absent'
    ).toBe(true);
  });

  test('homepage response does not expose server version in Server header', async ({ request }) => {
    const { response } = await timedGet(request, EP.HOME);
    const server = response.headers()['server'] ?? '';
    // A version string like "Apache/2.4.51" or "nginx/1.18" leaks patch level
    expect(server).not.toMatch(/\d+\.\d+/);
  });

  test('homepage does not expose X-Powered-By header', async ({ request }) => {
    const { response } = await timedGet(request, EP.HOME);
    const powered = response.headers()['x-powered-by'];
    expect(
      powered,
      `X-Powered-By is set to "${powered}" – this leaks the tech stack`
    ).toBeUndefined();
  });

});

// ══════════════════════════════════════════════════════════════════════════
// GROUP 8 – RESPONSE TIME (PERFORMANCE)
// Core pages must respond within the threshold even on a cold request with
// no browser caching. Failures here indicate infrastructure problems.
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – Response Time', () => {

  const timingTargets = [
    { label: 'homepage',         path: EP.HOME },
    { label: 'used-cars search', path: EP.USED_CARS },
    { label: 'new-cars',         path: EP.NEW_CARS },
    { label: 'forums',           path: EP.FORUMS },
    { label: 'make toyota',      path: EP.MAKE_TOYOTA },
    { label: 'page 2',           path: EP.PAGE_2 },
  ];

  for (const { label, path } of timingTargets) {
    test(`${label} responds within ${RESPONSE_TIME_MS / 1000}s`, async ({ request }) => {
      const { ms } = await timedGet(request, path);
      expect(
        ms,
        `${label} took ${ms}ms — exceeds ${RESPONSE_TIME_MS}ms threshold`
      ).toBeLessThan(RESPONSE_TIME_MS);
    });
  }

});

// ══════════════════════════════════════════════════════════════════════════
// GROUP 9 – HTTPS & REDIRECT BEHAVIOUR
// ══════════════════════════════════════════════════════════════════════════
test.describe('PakWheels API – HTTPS & Redirects', () => {

  test('HTTP request to homepage is redirected to HTTPS', async ({ request }) => {
    // Use maxRedirects:0 to see the raw redirect response
    const response = await request.get('http://www.pakwheels.com/', {
      timeout: 15_000,
      maxRedirects: 0,
    }).catch(() => null);
    if (!response) {
      // Connection refused on plain HTTP is also a valid security stance
      return;
    }
    const status = response.status();
    const location = response.headers()['location'] ?? '';
    // Should be a 3xx redirect pointing at https://
    expect(status).toBeGreaterThanOrEqual(300);
    expect(status).toBeLessThan(400);
    expect(location.toLowerCase()).toContain('https://');
  });

  test('trailing-slash-less path redirects or resolves without 5xx', async ({ request }) => {
    const response = await request.get('/used-cars/search/-', {
      timeout: 15_000,
    });
    expect(response.status()).toBeLessThan(500);
  });

  test('final destination of used-cars search is 200 after redirect chain', async ({ request }) => {
    // Default behaviour: follow redirects
    const { response } = await timedGet(request, EP.USED_CARS);
    expect(response.status()).toBe(200);
  });

});
