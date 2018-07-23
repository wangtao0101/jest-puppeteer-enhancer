import { Page } from 'puppeteer';

async function getDisplay(page: Page) {
  const handle =  await page.evaluateHandle(() => {
    const el = document.querySelector('.hoverChild');
    return window.getComputedStyle(el!).display;
  });
  return handle.jsonValue();
}

describe('toHover', () => {
  let page;
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:4444');
  });

  test('page.toHover', async () => {
    expect(await getDisplay(page)).toBe('none');
    await expect(page).toHover('.hoverFather');
    expect(await getDisplay(page)).toBe('block');
  });

  test('elementHandle.toHover', async () => {
    expect(await getDisplay(page)).toBe('none');
    const body = await page.$('body');
    await expect(body).toHover('.hoverFather');
    expect(await getDisplay(page)).toBe('block');
  });
});
