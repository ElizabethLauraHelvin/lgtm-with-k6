
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { exec } from 'k6/execution';
import {
  BASE_URL,
  TEST_EMAIL,
  TEST_PASSWORD,
  SELECTORS,
  THINK_TIME_SECONDS,
} from './config.js';

export const journeySuccess = new Rate('journey_success');
export const journeyDuration = new Trend('journey_duration_ms', true);
export const journeyFailures = new Counter('journey_failures');
export const firstFailureTimestamp = new Trend('failure_timestamp_ms', true);
export const failureVus = new Trend('failure_vus', true);

function assert(condition, message) {
  check(condition, {
    [message]: value => value === true,
  });

  if (!condition) {
    throw new Error(message);
  }
}

async function login(page) {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error(
      'GitHub Secrets K6_TEST_EMAIL dan K6_TEST_PASSWORD belum diatur.'
    );
  }

  const loginButton = page.locator('#auth button')
    .filter({ hasText: 'Masuk' });

  await loginButton.waitFor({
    state: 'visible',
    timeout: 15000,
  });

  await loginButton.click();

  await page.locator(SELECTORS.email).waitFor({
    state: 'visible',
    timeout: 10000,
  });

  await page.locator(SELECTORS.email).fill(TEST_EMAIL);
  await page.locator(SELECTORS.password).fill(TEST_PASSWORD);
  await page.locator(SELECTORS.loginSubmit).click();

  await page.locator(SELECTORS.loggedIn).waitFor({
    state: 'visible',
    timeout: 20000,
  });

  const greeting = await page.locator(SELECTORS.loggedIn).textContent();

  assert(
    Boolean(greeting && greeting.trim()),
    'Login should display authenticated user'
  );
}

async function browseProducts(page) {
  const response = await page.goto(`${BASE_URL}/`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  assert(
    Boolean(
      response &&
      response.status() >= 200 &&
      response.status() < 400
    ),
    'Homepage should return HTTP 2xx/3xx'
  );

  await page.locator('#app .grid .card').first().waitFor({
    state: 'visible',
    timeout: 20000,
  });

  const count = await page.locator('#app .grid .card').count();

  assert(
    count > 0,
    'Product listing should contain products'
  );

  return count;
}

async function addFirstProduct(page) {
  const addButton = page.locator(
    '#app .grid .card .btn'
  ).first();

  await addButton.waitFor({
    state: 'visible',
    timeout: 15000,
  });

  await addButton.click();

  await page.locator('#cnt').waitFor({
    state: 'visible',
    timeout: 10000,
  });

  const cartCount = Number(
    await page.locator('#cnt').textContent()
  );

  assert(
    cartCount > 0,
    'Product should be added to cart'
  );
}

async function openCart(page) {
  await page.locator('header button.btn').click();

  await page.locator('#drawer.show').waitFor({
    state: 'visible',
    timeout: 10000,
  });

  await page.locator('#drawer .items .row').first().waitFor({
    state: 'visible',
    timeout: 10000,
  });
}

async function checkoutReview(page) {
  // Open checkout modal
  await page.locator('#drawer button.btn').click();

  await page.locator('#ov.show #modal').waitFor({
    state: 'visible',
    timeout: 10000,
  });

  // Wait for checkout form
  await page.locator('#f_s').waitFor({
    state: 'visible',
    timeout: 10000,
  });

  await page.locator('#f_p').waitFor({
    state: 'visible',
    timeout: 10000,
  });

  assert(
    await page.locator('#co_tot').isVisible(),
    'Checkout total should be visible'
  );

  // Select shipping method
  await page.locator('#f_s').selectOption('reguler');

  // Select payment method
  await page.locator('#f_p').selectOption({
    label: 'QRIS',
  });

  // Verify checkout form values
  const shipping = await page.locator('#f_s').inputValue();
  const payment = await page.locator('#f_p').inputValue();

  assert(
    shipping === 'reguler',
    'Shipping method should be reguler'
  );

  assert(
    payment === 'QRIS',
    'Payment method should be QRIS'
  );

  // Register response listener BEFORE clicking submit.
  // This verifies the actual backend POST /api/orders request.
  const orderResponsePromise = page.waitForResponse(
    response => {
      return (
        response.request().method() === 'POST' &&
        response.url().includes('/api/orders')
      );
    },
    {
      timeout: 20000,
    }
  );

  // Click "Buat Pesanan"
  await page.locator('#co_go').click();

  // Wait for backend response
  const orderResponse = await orderResponsePromise;

  const status = orderResponse.status();

  assert(
    status === 201,
    `POST /api/orders should return HTTP 201, received ${status}`
  );

  // Read response body
  const orderData = await orderResponse.json();

  assert(
    Boolean(orderData && orderData.id),
    'Order response should contain an order ID'
  );

  console.log(
    `ORDER_CREATED id=${orderData.id} status=${status} payment=${payment} shipping=${shipping}`
  );

  return orderData;
}

export async function runJourney(
  page,
  type = 'journey',
  { recordMetrics = true } = {}
) {
  const started = Date.now();
  let ok = false;

  try {
    // Step 1: Open homepage and browse products
    await browseProducts(page);

    // Homepage-only scenario
    if (type === 'homepage') {
      ok = true;
      return;
    }

    // Product detail scenario
    if (type === 'product') {
      await page.locator(
        '#app .grid .card .img'
      ).first().click();

      await page.locator('#ov.show #modal').waitFor({
        state: 'visible',
        timeout: 10000,
      });

      ok = true;
      return;
    }

    // Step 2: Login
    await login(page);

    if (type === 'login') {
      ok = true;
      return;
    }

    // Step 3: Browse products again after login
    await browseProducts(page);

    // Step 4: Add product to cart
    await addFirstProduct(page);

    // Step 5: Open cart
    await openCart(page);

    if (type === 'cart') {
      ok = true;
      return;
    }

    // Step 6: Checkout and create a real order
    const order = await checkoutReview(page);

    assert(
      Boolean(order && order.id),
      'Checkout should create an order successfully'
    );

    ok = true;

  } catch (error) {
    if (recordMetrics) {
      journeyFailures.add(1);
      firstFailureTimestamp.add(Date.now());
      failureVus.add(exec.instance.vusActive);
    }

    console.error(
      `BROWSER_JOURNEY_FAILURE timestamp_ms=${Date.now()} active_vus=${exec.instance.vusActive} type=${type} error=${String(error).replace(/\s+/g, ' ').slice(0, 500)}`
    );

    throw error;

  } finally {
    if (recordMetrics) {
      journeySuccess.add(ok);
      journeyDuration.add(Date.now() - started);
    }

    if (THINK_TIME_SECONDS > 0) {
      sleep(THINK_TIME_SECONDS);
    }
  }
}
