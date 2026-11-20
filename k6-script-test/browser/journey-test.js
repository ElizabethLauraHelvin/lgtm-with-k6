import { browser } from 'k6/browser';
import { runJourney } from './journey.js';

export const options = {
  scenarios: {
    journey_browser: {
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
    await runJourney(page, 'journey');
  } finally {
    await page.close();
  }
}
