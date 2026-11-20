import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { exec } from 'k6/execution';
import {
  BASE_URL, TEST_EMAIL, TEST_PASSWORD, PATHS, SELECTORS,
} from './config.js';

export const journeySuccess = new Rate('journey_success');
export const journeyDuration = new Trend('journey_duration_ms', true);
export const journeyFailures = new Counter('journey_failures');
export const failureTimestamp = new Trend('failure_timestamp_ms', true);
export const failureVus = new Trend('failure_vus', true);

async function waitVisible(page, selector, label) {
  const element = page.locator(selector);
  await element.waitFor({ state: 'visible', timeout: 15000 });
  const visible = await element.isVisible();
  check(visible, {
    [`${label} is visible`]: (value) => value === true,
  });
  if (!visible) throw new Error(`${label} is not visible`);
  return element;
}

async function login(page) {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    throw new Error('TEST_EMAIL dan TEST_PASSWORD wajib diisi untuk skenario login.');
  }

  await page.goto(`${BASE_URL}${PATHS.login}`);
  await page.locator(SELECTORS.email).fill(TEST_EMAIL);
  await page.locator(SELECTORS.password).fill(TEST_PASSWORD);
  await page.locator(SELECTORS.loginSubmit).click();
  await waitVisible(page, SELECTORS.dashboard, 'Dashboard');
}

async function openProductDetail(page) {
  await page.goto(`${BASE_URL}${PATHS.products}`);
  const products = page.locator(SELECTORS.productCard);
  await products.first().waitFor({ state: 'visible', timeout: 15000 });

  const count = await products.count();
  check(count, {
    'Product listing contains at least one product': (n) => n > 0,
  });
  if (count < 1) throw new Error('Product listing is empty');

  if (PATHS.productDetail) {
    await page.goto(`${BASE_URL}${PATHS.productDetail}`);
  } else {
    await products.first().click();
  }

  await waitVisible(page, SELECTORS.productDetail, 'Product detail');
}

export async function runJourney(page, journeyType) {
  const started = Date.now();
  let success = false;

  try {
    if (journeyType === 'homepage') {
      const response = await page.goto(`${BASE_URL}${PATHS.home}`);
      const homepageOk = !!response && response.status() >= 200 && response.status() < 300;
      check(homepageOk, {
        'Homepage returns HTTP 2xx': (ok) => ok,
      });
      if (!homepageOk) throw new Error(`Homepage returned HTTP ${response ? response.status() : 'no response'}`);
      await page.locator('body').waitFor({ state: 'visible' });
      const title = await page.title();
      check(title, {
        'Homepage title is present': (value) => value.length > 0,
      });
      if (!title) throw new Error('Homepage title is empty');
    }

    if (journeyType === 'product') {
      await openProductDetail(page);
    }

    if (journeyType === 'login') {
      await login(page);
    }

    if (journeyType === 'cart') {
      await login(page);
      await openProductDetail(page);
      await page.locator(SELECTORS.addToCart).click();
      await page.goto(`${BASE_URL}${PATHS.cart}`);
      await waitVisible(page, SELECTORS.cartItem, 'Cart item');
    }

    if (journeyType === 'checkout') {
      // Checkout test intentionally stops at the review page.
      // It does NOT submit/place a real order.
      await login(page);
      await openProductDetail(page);
      await page.locator(SELECTORS.addToCart).click();
      await page.goto(`${BASE_URL}${PATHS.cart}`);
      await waitVisible(page, SELECTORS.cartItem, 'Cart item');
      await page.locator(SELECTORS.checkoutButton).click();
      await waitVisible(page, SELECTORS.checkoutReview, 'Checkout review');
    }

    if (journeyType === 'journey' || journeyType === 'capacity') {
      // Read-heavy journey for capacity testing. No order/payment is submitted.
      const response = await page.goto(`${BASE_URL}${PATHS.home}`);
      check(response, {
        'Homepage returns HTTP 2xx': (r) => !!r && r.status() >= 200 && r.status() < 300,
      });
      await openProductDetail(page);
      await page.locator('body').waitFor({ state: 'visible' });
    }

    success = true;
  } catch (error) {
    journeyFailures.add(1);
    failureTimestamp.add(Date.now());
    failureVus.add(exec.instance.vusActive);
    console.error(
      `BROWSER_JOURNEY_FAILURE type=${journeyType} timestamp=${Date.now()} active_vus=${exec.instance.vusActive} error=${String(error)}`
    );
  } finally {
    journeySuccess.add(success);
    journeyDuration.add(Date.now() - started);
  }

  sleep(Number(__ENV.THINK_TIME_SECONDS || 1));
  return success;
}
