import { browser } from 'k6/browser';
import { runJourney } from './journey.js';

export const options = {
  scenarios: {
    cart_browser: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: { browser: { type: 'chromium' } },
    },
  },
};

export default async function () {
  const page = await browser.newPage();
  try {
    await runJourney(page, 'cart');
  } finally {
    await page.close();
  }
}
