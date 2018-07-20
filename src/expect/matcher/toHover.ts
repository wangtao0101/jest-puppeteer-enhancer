import toMatchElement from 'expect-puppeteer/lib/matchers/toMatchElement';

async function toHover(instance, selector, options) {
  const element = await toMatchElement(instance, selector, options);
  await element.click(options);
}

export default toHover;
