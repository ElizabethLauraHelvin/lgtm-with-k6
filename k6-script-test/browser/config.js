import { browser } from 'k6/browser';

export const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
export const TEST_EMAIL = __ENV.TEST_EMAIL || '';
export const TEST_PASSWORD = __ENV.TEST_PASSWORD || '';

export const PATHS = {
  home: __ENV.HOME_PATH || '/',
  products: __ENV.PRODUCTS_PATH || '/products',
  login: __ENV.LOGIN_PATH || '/login',
  cart: __ENV.CART_PATH || '/cart',
  checkout: __ENV.CHECKOUT_PATH || '/checkout',
  productDetail: __ENV.PRODUCT_DETAIL_PATH || '',
};

export const SELECTORS = {
  productCard: __ENV.PRODUCT_CARD_SELECTOR || '[data-testid="product-card"]',
  productDetail: __ENV.PRODUCT_DETAIL_SELECTOR || '[data-testid="product-detail"]',
  addToCart: __ENV.ADD_TO_CART_SELECTOR || '[data-testid="add-to-cart"]',
  cartItem: __ENV.CART_ITEM_SELECTOR || '[data-testid="cart-item"]',
  email: __ENV.EMAIL_SELECTOR || 'input[name="email"]',
  password: __ENV.PASSWORD_SELECTOR || 'input[name="password"]',
  loginSubmit: __ENV.LOGIN_SUBMIT_SELECTOR || 'button[type="submit"]',
  dashboard: __ENV.DASHBOARD_SELECTOR || '[data-testid="dashboard"]',
  checkoutButton: __ENV.CHECKOUT_BUTTON_SELECTOR || '[data-testid="checkout-button"]',
  checkoutReview: __ENV.CHECKOUT_REVIEW_SELECTOR || '[data-testid="checkout-review"]',
};

export function browserOptions() {
  return {
    scenarios: {
      browser_test: {
        executor: 'shared-iterations',
        vus: 1,
        iterations: 1,
        options: { browser: { type: 'chromium' } },
      },
    },
  };
}

export async function newPage() {
  return await browser.newPage();
}
