import { Page } from 'puppeteer';

describe('toWaitForResponseJson', () => {
  let page: Page;
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:4444');
  });

  test('toWaitForResponseJson string', async () => {
    const json = await expect(page).toWaitForResponseJson('https://randomuser.me/api/');
    expect(Object.keys(json)).toContain('results');
  });

  test('toWaitForResponseJson regexp', async () => {
    await expect(page).toWaitForResponseJson(new RegExp('^https://randomuser.me'));
  });

  test('toWaitForResponseJson Predicate', async () => {
    await expect(page).toWaitForResponseJson((response) => response.url().startsWith('https://randomuser.me'));
  });
});
