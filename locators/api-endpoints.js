// locators/api-endpoints.js
// Central registry of every URL path tested at the HTTP layer.
// All paths are relative to the baseURL in playwright.config.js
// (https://www.pakwheels.com) so they work both locally and in CI.

const API_ENDPOINTS = {

  // ── Core pages ────────────────────────────────────────────────
  HOME:           '/',
  USED_CARS:      '/used-cars/search/-/',
  NEW_CARS:       '/new-cars/',
  FORUMS:         '/forums/',

  // ── Make-filtered search ──────────────────────────────────────
  MAKE_TOYOTA:    '/used-cars/search/-/make-toyota/',
  MAKE_SUZUKI:    '/used-cars/search/-/make-suzuki/',
  MAKE_HONDA:     '/used-cars/search/-/make-honda/',

  // ── Pagination ────────────────────────────────────────────────
  PAGE_2:         '/used-cars/search/-/?page=2',
  PAGE_LARGE:     '/used-cars/search/-/?page=99999',
  PAGE_NEGATIVE:  '/used-cars/search/-/?page=-1',
  PAGE_ALPHA:     '/used-cars/search/-/?page=abc',

  // ── Sort params ───────────────────────────────────────────────
  SORT_PRICE_ASC:  '/used-cars/search/-/?sort=price_asc',
  SORT_PRICE_DESC: '/used-cars/search/-/?sort=price_desc',
  SORT_DATE_DESC:  '/used-cars/search/-/?sort=date_desc',

  // ── Price range params ────────────────────────────────────────
  PRICE_MIN:        '/used-cars/search/-/?price_min=500000',
  PRICE_MAX:        '/used-cars/search/-/?price_max=3000000',
  PRICE_RANGE:      '/used-cars/search/-/?price_min=500000&price_max=3000000',
  PRICE_INVERTED:   '/used-cars/search/-/?price_min=5000000&price_max=100000',
  PRICE_EQUAL:      '/used-cars/search/-/?price_min=1000000&price_max=1000000',

  // ── Error / edge-case paths ───────────────────────────────────
  NOT_FOUND:         '/this-page-absolutely-does-not-exist-xyz123',
  FAKE_MAKE:         '/used-cars/search/-/make-zzzmakenotreal99999/',
  FAKE_NEW_CAR:      '/new-cars/fakebrandxyz99999/',
  FAKE_MODEL:        '/new-cars/suzuki/model-doesnotexist-xyz/',

  // ── Injection / fuzzing ───────────────────────────────────────
  SQL_INJECTION:     "/used-cars/search/-/make-' OR '1'='1/",
  LONG_SLUG:         '/used-cars/search/-/make-' + 'a'.repeat(300) + '/',

  // ── Security / misc ───────────────────────────────────────────
  XSS_QUERY:         '/?q=<script>alert(1)</script>',
};

// Pages that must return HTTP 200
const HAPPY_PATH_PAGES = [
  { label: 'homepage',           path: API_ENDPOINTS.HOME },
  { label: 'used-cars search',   path: API_ENDPOINTS.USED_CARS },
  { label: 'new-cars',           path: API_ENDPOINTS.NEW_CARS },
  { label: 'forums',             path: API_ENDPOINTS.FORUMS },
  { label: 'toyota make filter', path: API_ENDPOINTS.MAKE_TOYOTA },
  { label: 'suzuki make filter', path: API_ENDPOINTS.MAKE_SUZUKI },
  { label: 'honda make filter',  path: API_ENDPOINTS.MAKE_HONDA },
  { label: 'page 2',             path: API_ENDPOINTS.PAGE_2 },
  { label: 'sort price asc',     path: API_ENDPOINTS.SORT_PRICE_ASC },
  { label: 'sort price desc',    path: API_ENDPOINTS.SORT_PRICE_DESC },
  { label: 'sort date desc',     path: API_ENDPOINTS.SORT_DATE_DESC },
  { label: 'price min filter',   path: API_ENDPOINTS.PRICE_MIN },
  { label: 'price max filter',   path: API_ENDPOINTS.PRICE_MAX },
  { label: 'price range',        path: API_ENDPOINTS.PRICE_RANGE },
];

// Pages that must NOT return a 5xx server error
const NO_SERVER_ERROR_PAGES = [
  { label: 'fake make slug',    path: API_ENDPOINTS.FAKE_MAKE },
  { label: 'fake new car',      path: API_ENDPOINTS.FAKE_NEW_CAR },
  { label: 'fake suzuki model', path: API_ENDPOINTS.FAKE_MODEL },
  { label: 'inverted price',    path: API_ENDPOINTS.PRICE_INVERTED },
  { label: 'equal price range', path: API_ENDPOINTS.PRICE_EQUAL },
  { label: 'large page number', path: API_ENDPOINTS.PAGE_LARGE },
  { label: 'negative page',     path: API_ENDPOINTS.PAGE_NEGATIVE },
  { label: 'alpha page value',  path: API_ENDPOINTS.PAGE_ALPHA },
  { label: 'sql injection',     path: API_ENDPOINTS.SQL_INJECTION },
  { label: 'long slug',         path: API_ENDPOINTS.LONG_SLUG },
  { label: 'xss query param',   path: API_ENDPOINTS.XSS_QUERY },
];

module.exports = { API_ENDPOINTS, HAPPY_PATH_PAGES, NO_SERVER_ERROR_PAGES };
