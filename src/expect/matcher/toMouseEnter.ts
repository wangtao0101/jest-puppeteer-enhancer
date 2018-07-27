import toMatchElement from 'expect-puppeteer/lib/matchers/toMatchElement';
import { Page } from 'puppeteer';
const getPuppeteerType = require('expect-puppeteer/lib/utils').getPuppeteerType;

async function toMouseEnter(instance, selector, options) {

  let page: Page | null = null;
  const type = getPuppeteerType(instance);
  if (type === 'Page') {
    page = instance;
  } else {
    page = instance._page;
  }

  const element = await toMatchElement(instance, selector, options);
  await element._scrollIntoViewIfNeeded();
  const { x, y, width, height } = await element.boundingBox();
  await page!.mouse.move(x + width / 2, y + height / 2);
}

export default toMouseEnter;
