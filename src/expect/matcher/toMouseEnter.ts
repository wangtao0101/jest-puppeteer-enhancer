import toMatchElement from 'expect-puppeteer/lib/matchers/toMatchElement';
import { Page } from 'puppeteer';

async function toMouseEnter(instance: Page, selector, options) {
  const element = await toMatchElement(instance, selector, options);
  const { x, y, width, height } = await element.boundingBox();
  await instance.mouse.move(x + width / 2, y + height / 2);
}

export default toMouseEnter;
