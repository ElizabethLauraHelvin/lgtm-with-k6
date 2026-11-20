import { browser } from 'k6/browser';
import { browserOptions } from './config.js';
import { runJourney } from './journey.js';

export const options = browserOptions();

export default async function () {
  const page = await browser.newPage();
  try {
    await runJourney(page, 'homepage');
  } finally {
    await page.close();
  }
}
