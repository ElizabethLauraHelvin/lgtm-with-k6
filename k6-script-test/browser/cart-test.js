
import { browser } from 'k6/browser';
import { runJourney } from './journey.js';

export const options = {
  scenarios: {
    cart_browser: {
      executor: 'per-vu-iterations',
      vus: 10,
      iterations: 1,
      maxDuration: '5m',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export default async function () {
  let page;

  try {
    page = await browser.newPage();

    await runJourney(page, 'cart');

  } finally {
    if (page) {
      await page.close();
    }
  }
}
