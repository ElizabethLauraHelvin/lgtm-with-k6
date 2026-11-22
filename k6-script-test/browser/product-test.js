
import { browser } from 'k6/browser';
import { Rate, Counter } from 'k6/metrics';
import { runJourney } from './journey.js';
import { sleep } from 'k6';

// ==========================================
// CONFIGURATION
// ==========================================

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:8080')
  .replace(/\/$/, '');

const failureRateLimit = Math.min(
  0.5,
  Math.max(0.01, Number(__ENV.FAILURE_RATE_LIMIT || 0.10))
);

const maxRecoveryAttempts = 1;
const recoveryDelaySeconds = 3;

// ==========================================
// CUSTOM METRICS
// ==========================================

// 1 = successful session
// 0 = failed session
const browserSessionSuccess = new Rate('browser_session_success');

// Counts sessions that failed after all retries
const browserSessionFailures = new Counter('browser_session_failures');

// ==========================================
// K6 OPTIONS
// ==========================================

export const options = {
  scenarios: {
    product_browser: {
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
    browser_session_success: [
      {
        threshold: `rate>${1 - failureRateLimit}`,
        abortOnFail: true,
        delayAbortEval: '30s',
      },
    ],
  },
};

// ==========================================
// PRODUCT BROWSER TEST
// ==========================================

export default async function () {
  let sessionOk = false;

  for (
    let attempt = 0;
    attempt <= maxRecoveryAttempts;
    attempt++
  ) {
    let page;

    try {
      console.log(
        `PRODUCT_ATTEMPT attempt=${attempt + 1} max_attempts=${maxRecoveryAttempts + 1}`
      );

      // Create a new browser page
      page = await browser.newPage();

      // Execute product journey
      await runJourney(page, 'product', {
        recordMetrics: false,
      });

      // Session completed successfully
      sessionOk = true;

      console.log(
        `PRODUCT_SUCCESS attempt=${attempt + 1}`
      );

      break;

    } catch (error) {
      const errorMessage = String(error)
        .replace(/\s+/g, ' ')
        .slice(0, 500);

      console.error(
        `PRODUCT_BROWSER_FAILURE attempt=${attempt + 1} error=${errorMessage}`
      );

      if (attempt === maxRecoveryAttempts) {
        console.error(
          'PRODUCT_RECOVERY_FAILED: maximum retry reached'
        );
      }

    } finally {
      // Always attempt to close the browser page
      if (page) {
        try {
          await page.close();

          console.log(
            `PRODUCT_PAGE_CLOSED attempt=${attempt + 1}`
          );

        } catch (closeError) {
          console.error(
            `PRODUCT_CLEANUP_FAILURE error=${String(closeError)
              .replace(/\s+/g, ' ')
              .slice(0, 500)}`
          );
        }
      }
    }

    // Wait before retrying
    if (
      !sessionOk &&
      attempt < maxRecoveryAttempts
    ) {
      console.warn(
        `PRODUCT_RECOVERY_WAIT seconds=${recoveryDelaySeconds}`
      );

      sleep(recoveryDelaySeconds);
    }
  }

  // ==========================================
  // RECORD FINAL SESSION RESULT
  // ==========================================

  // Record exactly one result per completed session
  browserSessionSuccess.add(sessionOk);

  if (!sessionOk) {
    browserSessionFailures.add(1);

    console.error(
      'PRODUCT_SESSION_FAILED: browser journey failed after all retries'
    );
  }

  // Small delay between iterations
  sleep(2);
}
