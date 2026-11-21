
import { browser } from 'k6/browser';
import { Rate } from 'k6/metrics';
import { runJourney } from './journey.js';

const maxVus = Math.max(2, Math.min(50, Number(__ENV.MAX_VUS || 50)));
const step = Math.max(1, Math.min(maxVus, Number(__ENV.VUS_STEP || 2)));
const stageDuration = __ENV.STAGE_DURATION || '30s';
const failureRateLimit = Math.min(
  0.5,
  Math.max(0.01, Number(__ENV.FAILURE_RATE_LIMIT || 0.10))
);

// Metric untuk mencatat keberhasilan sesi browser.
const browserSessionSuccess = new Rate('browser_session_success');

const stages = [];

for (let target = step; target < maxVus; target += step) {
  stages.push({ duration: stageDuration, target });
}

stages.push({ duration: stageDuration, target: maxVus });
stages.push({ duration: '10s', target: 0 });

export const options = {
  scenarios: {
    browser_capacity: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages,
      gracefulRampDown: '10s',
      gracefulStop: '20s',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },

  thresholds: {
    // Threshold keberhasilan journey.
    journey_success: [{
      threshold: `rate>${1 - failureRateLimit}`,
      abortOnFail: true,
      delayAbortEval: '30s',
    }],

    // Threshold keberhasilan sesi browser.
    browser_session_success: [{
      threshold: `rate>${1 - failureRateLimit}`,
      abortOnFail: true,
      delayAbortEval: '30s',
    }],
  },
};

export default async function () {
  let page;
  let sessionOk = false;

  try {
    page = await browser.newPage();

    await runJourney(page, 'capacity');

    sessionOk = true;

  } catch (error) {
    console.error(
      `BROWSER_SESSION_FAILURE timestamp_ms=${Date.now()} error=${String(error).replace(/\s+/g, ' ').slice(0, 500)}`
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
