import { browser } from 'k6/browser';
import { runJourney } from './journey.js';

export const options = {
  scenarios: {
    checkout_browser: {
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
    await runJourney(page, 'checkout');
  } finally {
    await page.close();
  }
}
