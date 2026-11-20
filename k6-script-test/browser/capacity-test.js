import { browser } from 'k6/browser';
import { runJourney } from './journey.js';

const maxVus = Math.max(2, Math.min(50, Number(__ENV.MAX_VUS || 50)));
const step = Math.max(1, Math.min(maxVus, Number(__ENV.VUS_STEP || 2)));
const stageDuration = __ENV.STAGE_DURATION || '30s';
const failureRateLimit = Math.min(0.5, Math.max(0.01, Number(__ENV.FAILURE_RATE_LIMIT || 0.10)));

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
      options: { browser: { type: 'chromium' } },
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
}
