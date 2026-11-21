
import { browser } from 'k6/browser';
import { runJourney } from './journey.js';
import { sleep } from 'k6';

export const options = {
  scenarios: {
    login_browser: {
      executor: 'ramping-vus',

      // Mulai dari 1 VU
      startVUs: 1,

      stages: [
        { duration: '1m', target: 1 },
        { duration: '1m', target: 3 },
        { duration: '1m', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '1m', target: 15 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 30 },
        { duration: '1m', target: 40 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 60 },
        { duration: '1m', target: 70 },
        { duration: '1m', target: 80 },
        { duration: '1m', target: 90 },
        { duration: '1m', target: 100 },
        { duration: '1m', target: 0 },
      ],

      gracefulRampDown: '10s',

      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },

  // Hentikan test jika performa mulai melewati batas
  thresholds: {
    journey_success: [
      {
        threshold: 'rate>0.90',
        abortOnFail: true,
        delayAbortEval: '30s',
      },
    ],

    journey_duration_ms: [
      'p(95)<5000',
    ],
  },

  // Batas maksimum VU
  maxVUs: 100,
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
