
import { browser } from 'k6/browser';
import { Rate } from 'k6/metrics';
import { runJourney } from './journey.js';
import { sleep } from 'k6';

const failureRateLimit = Math.min(
  0.5,
  Math.max(0.01, Number(__ENV.FAILURE_RATE_LIMIT || 0.10))
);

// Menghitung keberhasilan sesi browser.
const browserSessionSuccess = new Rate('browser_session_success');

export const options = {
  scenarios: {
    login_browser: {
      executor: 'ramping-vus',

      // Mulai dari 1 VU.
      startVUs: 1,

      stages: [
        { duration: '1m', target: 1 },
        { duration: '1m', target: 3 },
        { duration: '1m', target: 5 },
        { duration: '1m', target: 10 },
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
    // Menghentikan test jika journey success di bawah batas.
    journey_success: [{
      threshold: `rate>${1 - failureRateLimit}`,
      abortOnFail: true,
      delayAbortEval: '30s',
    }],

    // Menghentikan test jika keberhasilan sesi browser di bawah batas.
    browser_session_success: [{
      threshold: `rate>${1 - failureRateLimit}`,
      abortOnFail: true,
      delayAbortEval: '30s',
    }],

    // Mempertahankan batas waktu login journey.
    journey_duration_ms: [
      'p(95)<5000',
    ],
  },

  maxVUs: 100,
};

export default async function () {
  let page;
  let sessionOk = false;

  try {
    page = await browser.newPage();

    await runJourney(page, 'login');

    sleep(2);

    sessionOk = true;

  } catch (error) {
    console.error(
      `LOGIN_BROWSER_FAILURE timestamp_ms=${Date.now()} error=${String(error).replace(/\s+/g, ' ').slice(0, 500)}`
    );

    throw error;

  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        sessionOk = false;

        console.error(
          `BROWSER_CLOSE_FAILURE timestamp_ms=${Date.now()} error=${String(closeError).replace(/\s+/g, ' ').slice(0, 500)}`
        );
      }
    }

    browserSessionSuccess.add(sessionOk);
  }
}
