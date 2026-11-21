
import { browser } from 'k6/browser';
import { Rate } from 'k6/metrics';
import { runJourney } from './journey.js';
import { sleep } from 'k6';

const failureRateLimit = Math.min(
  0.5,
  Math.max(0.01, Number(__ENV.FAILURE_RATE_LIMIT || 0.10))
);

const maxRecoveryAttempts = 1;
const recoveryDelaySeconds = 3;

const browserSessionSuccess = new Rate('browser_session_success');

export const options = {
  scenarios: {
    checkout_browser: {
      executor: 'ramping-vus',
      startVUs: 1,

      stages: [
        { duration: '1m', target: 1 },
        { duration: '1m', target: 3 },
        { duration: '1m', target: 5 },
        { duration: '1m', target: 10 },
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
    browser_session_success: [{
      threshold: `rate>${1 - failureRateLimit}`,
      abortOnFail: true,
      delayAbortEval: '30s',
    }],
  },
};

export default async function () {
  let sessionOk = false;

  for (let attempt = 0; attempt <= maxRecoveryAttempts; attempt++) {
    let page;

    try {
      console.log(
        `CHECKOUT_ATTEMPT attempt=${attempt + 1} max_attempts=${maxRecoveryAttempts + 1}`
      );

      page = await browser.newPage();

      await runJourney(page, 'checkout', {
        recordMetrics: false,
      });

      sessionOk = true;

      console.log(`CHECKOUT_SUCCESS attempt=${attempt + 1}`);
      break;

    } catch (error) {
      console.error(
        `CHECKOUT_BROWSER_FAILURE attempt=${attempt + 1} error=${String(error).replace(/\s+/g, ' ').slice(0, 500)}`
      );

      if (attempt === maxRecoveryAttempts) {
        console.error('CHECKOUT_RECOVERY_FAILED: maximum retry reached');
      }

    } finally {
      if (page) {
        try {
          await page.close();
          console.log(`CHECKOUT_PAGE_CLOSED attempt=${attempt + 1}`);
        } catch (closeError) {
          console.error(
            `CHECKOUT_CLEANUP_FAILURE error=${String(closeError).replace(/\s+/g, ' ').slice(0, 500)}`
          );
        }
      }
    }

    if (!sessionOk && attempt < maxRecoveryAttempts) {
      console.warn(`CHECKOUT_RECOVERY_WAIT seconds=${recoveryDelaySeconds}`);
      sleep(recoveryDelaySeconds);
    }
  }

  browserSessionSuccess.add(sessionOk);

  if (!sessionOk) {
    console.error('CHECKOUT_SESSION_FAILED');
  }

  sleep(2);
}
