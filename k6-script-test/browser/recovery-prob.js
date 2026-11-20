import { browser } from 'k6/browser';
import { check } from 'k6';

export const options = {
  scenarios: {
    recovery_probe: {
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
    const response = await page.goto(__ENV.BASE_URL, { timeout: 20000 });
    check(response, {
      'Homepage responds with HTTP 2xx': (r) => !!r && r.status() >= 200 && r.status() < 300,
    });
    await page.locator('body').waitFor({ state: 'visible', timeout: 15000 });
    check(await page.title(), {
      'Homepage renders a title': (title) => title.length > 0,
    });
  } finally {
    await page.close();
  }
}
