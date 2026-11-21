
import { browser } from 'k6/browser';
import { runJourney } from './journey.js';
import { sleep } from 'k6';

export const options = {
  scenarios: {
    login_browser: {
      executor: 'ramping-vus',

      // Mulai dengan 1 VU, naik bertahap sampai 5 VU
      startVUs: 1,

      stages: [
        { duration: '30s', target: 1 },
        { duration: '1m', target: 3 },
        { duration: '1m', target: 5 },
        { duration: '30s', target: 0 },
      ],

      gracefulRampDown: '10s',

      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },

  thresholds: {
    journey_success: ['rate>0.90'],
    journey_duration_ms: ['p(95)<5000'],
  },
};

export default async function () {
  const page = await browser.newPage();

  try {
    await runJourney(page, 'login');
    sleep(2);
  } finally {
    await page.close();
  }
}
