import { browser } from 'k6/browser';
import { Rate, Trend, Counter } from 'k6/metrics';
import { sleep } from 'k6';
import {
  BASE_URL,
  TEST_EMAIL,
  TEST_PASSWORD,
  SELECTORS,
  THINK_TIME_SECONDS,
} from './config.js';

// Allow MAX_VUS=1 for the initial validation run.
const maxVus = Math.max(1, Math.min(50, Number(__ENV.MAX_VUS || 50)));
const step = Math.max(
  1,
  Math.min(maxVus, Number(__ENV.CAPACITY_VUS_STEP || 5))
);
const stageDuration = __ENV.STAGE_DURATION || '30s';
const failureRateLimit = Math.min(
  0.5,
  Math.max(0.01, Number(__ENV.FAILURE_RATE_LIMIT || 0.10))
);

export const journeySuccess = new Rate('journey_success');
export const journeyDuration = new Trend('journey_duration_ms', true);
export const journeyFailures = new Counter('journey_failures');
export const orderCreated = new Counter('capacity_orders_created');
export const orderCreationFailures = new Counter(
  'capacity_order_creation_failures'
);

const stages = [];

for (let target = step; target < maxVus; target += step) {
  stages.push({ duration: stageDuration, target });
}

if (stages.length === 0 || stages[stages.length - 1].target !== maxVus) {
  stages.push({ duration: stageDuration, target: maxVus });
}

stages.push({ duration: '15s', target: 0 });

export const options = {
  scenarios: {
    browser_capacity: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages,
      gracefulRampDown: '15s',
      gracefulStop: '30s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    journey_success: [{
      threshold: `rate>${1 - failureRateLimit}`,
      // Evaluate the threshold at the end instead of aborting the ramp-up.
      // This preserves the full capacity-test result and artifacts.
      abortOnFail: false,
    }],
  },
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function performFullCheckoutCapacityJourney(page) {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error(
      'K6_TEST_EMAIL/K6_TEST_PASSWORD secrets are required for capacity scenario'
    );
  }

  // 1. Open homepage.
  const home = await page.goto(`${BASE_URL}/`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  assert(
    home && home.status() >= 200 && home.status() < 400,
    'Homepage did not return HTTP 2xx/3xx'
  );

  await page.locator(SELECTORS.productCards).first().waitFor({
    state: 'visible',
    timeout: 20000,
  });

  // 2. Login.
  await page.locator(SELECTORS.loginOpen)
    .filter({ hasText: 'Masuk' })
    .click();

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

  // 3. Browse products again after login.
  await page.goto(`${BASE_URL}/`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  await page.locator(SELECTORS.productCards).first().waitFor({
    state: 'visible',
    timeout: 20000,
  });

  // 4. Add a product to cart.
  await page.locator(SELECTORS.addToCart).first().click();

  await page.locator('#cnt').waitFor({
    state: 'visible',
    timeout: 10000,
  });

  const cartCount = Number(await page.locator('#cnt').textContent());
  assert(cartCount > 0, 'Product was not added to cart');

  // 5. Open cart.
  await page.locator(SELECTORS.cartOpen).click();

  await page.locator(SELECTORS.cartDrawer).waitFor({
    state: 'visible',
    timeout: 10000,
  });

  await page.locator(SELECTORS.cartItem).first().waitFor({
    state: 'visible',
    timeout: 10000,
  });

  // 6. Open checkout.
  await page.locator(SELECTORS.checkoutButton).click();

  await page.locator(SELECTORS.checkoutModal).waitFor({
    state: 'visible',
    timeout: 10000,
  });

  await page.locator(SELECTORS.checkoutShipping).waitFor({
    state: 'visible',
    timeout: 10000,
  });

  await page.locator(SELECTORS.checkoutPayment).waitFor({
    state: 'visible',
    timeout: 10000,
  });

  // 7. Select valid checkout values and verify total.
  await page.locator(SELECTORS.checkoutShipping).selectOption('reguler');
  await page.locator(SELECTORS.checkoutPayment).selectOption({
    label: 'QRIS',
  });

  assert(
    await page.locator('#co_tot').isVisible(),
    'Checkout total is not visible'
  );

  const shipping = await page.locator(SELECTORS.checkoutShipping).inputValue();
  const payment = await page.locator(SELECTORS.checkoutPayment).inputValue();

  assert(shipping === 'reguler', 'Shipping method should be reguler');
  assert(payment === 'QRIS', 'Payment method should be QRIS');

  // 8. Submit a real order.
  const submitButton = page.locator('#co_go');

  await submitButton.waitFor({
    state: 'visible',
    timeout: 10000,
  });

  assert(
    await submitButton.isEnabled(),
    'Checkout submit button should be enabled'
  );

  // Match the full URL and POST method; listener is installed before click.
  const orderResponsePromise = page.waitForResponse(
    response =>
      response.url().includes('/api/orders') &&
      response.request().method() === 'POST',
    { timeout: 30000 }
  );

  await submitButton.click();

  const orderResponse = await orderResponsePromise;

  assert(
    orderResponse.status() === 201,
    `POST /api/orders expected HTTP 201, received ${orderResponse.status()}`
  );

  const orderData = await orderResponse.json();

  assert(
    Boolean(orderData && orderData.id),
    'Successful POST /api/orders response did not contain an order ID'
  );

  orderCreated.add(1);

  console.log(
    `CAPACITY_ORDER_CREATED vu=${__VU} iteration=${__ITER} order_id=${orderData.id} status=201`
  );
}

export default async function () {
  const started = Date.now();
  let page;
  let ok = false;

  try {
    page = await browser.newPage();
    await performFullCheckoutCapacityJourney(page);
    ok = true;
  } catch (error) {
    journeyFailures.add(1);
    orderCreationFailures.add(1);

    console.error(
      `CAPACITY_FULL_CHECKOUT_FAILURE vu=${__VU} iteration=${__ITER} error=${String(error).replace(/\s+/g, ' ').slice(0, 500)}`
    );

    throw error;
  } finally {
    journeySuccess.add(ok);
    journeyDuration.add(Date.now() - started);

    if (page) {
      try {
        await page.close();
      } catch (error) {
        console.error(
          `CAPACITY_PAGE_CLOSE_FAILURE: ${String(error).slice(0, 300)}`
        );
      }
    }

    if (THINK_TIME_SECONDS > 0) {
      sleep(THINK_TIME_SECONDS);
    }
  }
}
