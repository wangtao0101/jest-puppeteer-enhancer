import { Page } from 'puppeteer';

describe('toMouseEnter', () => {
  let page: Page;
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:4444');
  });

  test('page.toMouseEnter', async () => {
    await expect(page).toMouseEnter('.mousemove');
    await expect(page).toMatch('mousemove');
  });

  test.only('elementHandle.toMouseEnter', async () => {
    const body = await page.$('body');
    await expect(body).toMouseEnter('.mousemove');
    await expect(page).toMatch('mousemove');
  });
});
