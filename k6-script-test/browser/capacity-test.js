import { browser } from 'k6/browser';
import { Rate, Trend, Counter } from 'k6/metrics';
import { runJourney } from './journey.js';

const maxVus = Math.max(1, Number(__ENV.MAX_VUS || 20));
const vusStep = Math.max(1, Number(__ENV.VUS_STEP || 2));
const stageDuration = __ENV.STAGE_DURATION || '1m';
const failureRateLimit = Math.min(1, Math.max(0.01, Number(__ENV.FAILURE_RATE_LIMIT || 0.10)));

const stages = [];
for (let target = vusStep; target < maxVus; target += vusStep) {
  stages.push({ duration: stageDuration, target });
}
stages.push({ duration: stageDuration, target: maxVus });
stages.push({ duration: '30s', target: 0 });

export const options = {
  scenarios: {
    browser_capacity: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages,
      gracefulRampDown: '15s',
      gracefulStop: '30s',
      options: {
        browser: { type: 'chromium' },
      },
    },
  },
  thresholds: {
    journey_success: [{
      threshold: `rate>${1 - failureRateLimit}`,
      abortOnFail: true,
      delayAbortEval: '30s',
    }],
  },
};

export default async function () {
  const page = await browser.newPage();
  try {
    await runJourney(page, 'capacity');
  } finally {
    await page.close();
  }
};
