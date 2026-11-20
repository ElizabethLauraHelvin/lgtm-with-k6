export const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:8080').replace(/\/+$/, '');
export const TEST_EMAIL = __ENV.TEST_EMAIL || '';
export const TEST_PASSWORD = __ENV.TEST_PASSWORD || '';

export const SELECTORS = {
  loginOpen: '#auth button',
  email: '#a_email',
  password: '#a_pass',
  loginSubmit: '#a_go',
  loggedIn: '#auth .hi',
  productCards: '#app .grid .card',
  productImage: '#app .grid .card .img',
  addToCart: '#app .grid .card .btn',
  cartOpen: 'header button.btn',
  cartDrawer: '#drawer.show',
  cartItem: '#drawer .items .row',
  checkoutButton: '#drawer button.btn',
  checkoutModal: '#ov.show #modal',
  checkoutShipping: '#f_s',
  checkoutPayment: '#f_p',
};

export const THINK_TIME_SECONDS = Math.max(0, Number(__ENV.THINK_TIME_SECONDS || 1));
export const REQUEST_TIMEOUT = __ENV.BROWSER_TIMEOUT || '30s';
