
import { browser } from 'k6/browser';
import { Rate } from 'k6/metrics';
import { runJourney } from './journey.js';
import { sleep } from 'k6';

// Batas toleransi kegagalan browser.
const failureRateLimit = Math.min(
  0.5,
  Math.max(0.01, Number(__ENV.FAILURE_RATE_LIMIT || 0.10))
);

// Recovery maksimal 1 kali.
const maxRecoveryAttempts = 1;
const recoveryDelaySeconds = 3;

// Mengukur keberhasilan sesi browser setelah recovery.
const browserSessionSuccess = new Rate('browser_session_success');

export const options = {
  scenarios: {
    product_browser: {
      executor: 'ramping-vus',
      startVUs: 1,

      // Maksimal 10 VU.
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
        `PRODUCT_ATTEMPT attempt=${attempt + 1} max_attempts=${maxRecoveryAttempts + 1}`
      );

      // Membuat browser page baru.
      page = await browser.newPage();

      // Menjalankan product journey.
      // Metrics journey dicatat sebagai hasil akhir sesi, bukan tiap percobaan.
      await runJourney(page, 'product', {
        recordMetrics: false,
      });

      sessionOk = true;

      console.log(`PRODUCT_SUCCESS attempt=${attempt + 1}`);
      break;

    } catch (error) {
      console.error(
        `PRODUCT_BROWSER_FAILURE attempt=${attempt + 1} error=${String(error).replace(/\s+/g, ' ').slice(0, 500)}`
      );

      if (attempt === maxRecoveryAttempts) {
        console.error('PRODUCT_RECOVERY_FAILED: maximum retry reached');
      }

    } finally {
      // Menutup page setiap percobaan.
      if (page) {
        try {
          await page.close();
          console.log(`PRODUCT_PAGE_CLOSED attempt=${attempt + 1}`);
        } catch (closeError) {
          console.error(
            `PRODUCT_CLEANUP_FAILURE error=${String(closeError).replace(/\s+/g, ' ').slice(0, 500)}`
          );
        }
      }
    }

    // Menunggu sebelum melakukan recovery.
    if (!sessionOk && attempt < maxRecoveryAttempts) {
      console.warn(`PRODUCT_RECOVERY_WAIT seconds=${recoveryDelaySeconds}`);
      sleep(recoveryDelaySeconds);
    }
  }

  // Mencatat hasil akhir setelah semua percobaan.
  browserSessionSuccess.add(sessionOk);

  if (!sessionOk) {
    console.error('PRODUCT_SESSION_FAILED');
  }

  sleep(2);
}
