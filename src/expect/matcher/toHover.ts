import toMatchElement from 'expect-puppeteer/lib/matchers/toMatchElement';

async function toHover(instance, selector) {
  const element = await toMatchElement(instance, selector);
  await element.hover();
}

export default toHover;
