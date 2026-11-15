import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
const EMAIL = __ENV.K6_TEST_EMAIL || '';
const PASSWORD = __ENV.K6_TEST_PASSWORD || '';
const INCLUDE_ORDER_WRITE = (__ENV.K6_INCLUDE_ORDER_WRITE || 'false') === 'true';
const INCLUDE_REGISTER = (__ENV.K6_INCLUDE_REGISTER || 'false') === 'true';
const PRODUCT_ID_OVERRIDE = __ENV.K6_PRODUCT_ID || '';

function apiTags(group, endpoint) {
  return { api_group: group, endpoint };
}

function parseJson(response) {
  try {
    return response.json();
  } catch (_) {
    return null;
  }
}

export function runApiIteration(testType) {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'K6_TEST_EMAIL and K6_TEST_PASSWORD must be configured as GitHub Actions secrets.',
    );
  }

  // 1. Product list: public API.
  const productsResponse = http.get(`${BASE_URL}/api/products`, {
    tags: apiTags('products', 'GET /api/products'),
  });
  check(productsResponse, {
    '[GET /api/products] status 200': (r) => r.status === 200,
  });

  const productsBody = parseJson(productsResponse);
  const products = Array.isArray(productsBody) ? productsBody : [];
  const productId = PRODUCT_ID_OVERRIDE || (products[0] && products[0].id);

  // 2. Product detail: use a real ID from the list unless overridden.
  if (productId !== undefined && productId !== null && String(productId) !== '') {
    const productDetailResponse = http.get(
      `${BASE_URL}/api/products/${encodeURIComponent(productId)}`,
      { tags: apiTags('products', 'GET /api/products/:id') },
    );
    check(productDetailResponse, {
      '[GET /api/products/:id] status 200': (r) => r.status === 200,
    });
  } else {
    check(false, {
      '[GET /api/products/:id] product ID available': () => false,
    });
  }

  // 3. Login on every iteration so login itself is included in load metrics.
  const loginResponse = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: EMAIL, password: PASSWORD }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: apiTags('authentication', 'POST /api/auth/login'),
    },
  );
  check(loginResponse, {
    '[POST /api/auth/login] status 200': (r) => r.status === 200,
  });

  const loginBody = parseJson(loginResponse);
  const token = loginBody && loginBody.token;

  if (!token) {
    // Protected endpoints are skipped when authentication fails.
    return;
  }

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
    tags: apiTags('authentication', 'GET /api/auth/me'),
  };

  // 4. Authenticated user profile.
  const meResponse = http.get(`${BASE_URL}/api/auth/me`, authHeaders);
  check(meResponse, {
    '[GET /api/auth/me] status 200': (r) => r.status === 200,
  });

  // 5. Authenticated order history.
  const ordersResponse = http.get(`${BASE_URL}/api/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    tags: apiTags('orders', 'GET /api/orders'),
  });
  check(ordersResponse, {
    '[GET /api/orders] status 200': (r) => r.status === 200,
  });

  // 6. Optional write test. Creates real order rows in the application DB.
  if (INCLUDE_ORDER_WRITE) {
    if (productId === undefined || productId === null || String(productId) === '') {
      check(false, {
        '[POST /api/orders] product ID available': () => false,
      });
    } else {
      const orderResponse = http.post(
        `${BASE_URL}/api/orders`,
        JSON.stringify({
          payment: 'Transfer Bank',
          shipping: 'reguler',
          items: [{ productId, qty: 1 }],
        }),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          tags: apiTags('orders', 'POST /api/orders'),
        },
      );
      check(orderResponse, {
        '[POST /api/orders] status 201': (r) => r.status === 201,
      });
    }
  }

  // 7. Optional register test. Creates a new user for each iteration.
  // Disabled by default to avoid uncontrolled user-table growth.
  if (INCLUDE_REGISTER) {
    const unique = `${Date.now()}-${__VU}-${__ITER}`;
    const registerResponse = http.post(
      `${BASE_URL}/api/auth/register`,
      JSON.stringify({
        name: `K6 Test ${unique}`,
        email: `k6-${unique}@example.test`,
        password: 'K6TestPassword123',
        phone: '081234567890',
        address: 'K6 automated test address',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: apiTags('authentication', 'POST /api/auth/register'),
      },
    );
    check(registerResponse, {
      '[POST /api/auth/register] status 201': (r) => r.status === 201,
    });
  }
}
