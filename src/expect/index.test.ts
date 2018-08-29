import { extendExpectPage, extendExpectElementHandle } from '.';

describe('expect', () => {

  beforeEach(async () => {
    await page.goto('http://localhost:4444');
  });

  test('expect-puppeteer work well with original expect', async () => {
    await expect(page).toBeDefined();
    await expect(page).toMatch('home');
    await expect(page).toWaitFor(10);
  });

  test('expect page', async () => {
    const pageExpectArray = [
      'toWaitFor',
      'toWaitForFunction',
      'toWaitForNavigation',
      'toWaitForRequest',
      'toWaitForResponse',
      'toWaitForSelector',
      'toWaitForXPath',
      'toMouseEnter',
      'toHover',
      'toGoto',
      'toGoBack',
      'toGoForward',
      'toClick',
      'toDisplayDialog',
      'toFill',
      'toFillForm',
      'toMatch',
      'toMatchElement',
      'toSelect',
      'toUploadFile',
    ];
    const pageExpectNotArray = [
      'toMatch',
      'toMatchElement',
    ];
    await expect(Object.keys(expect(page))).toEqual(expect.arrayContaining(pageExpectArray));
    await expect(Object.keys(expect(page).not)).toEqual(expect.arrayContaining(pageExpectNotArray));
  });

  test('expect elementHandle', async () => {
    const elementHandleExpectArray = [
      'toClick',
      'toFill',
      'toFillForm',
      'toMatch',
      'toMatchElement',
      'toSelect',
      'toUploadFile',
    ];
    const elementHandleExpectNotArray = [
      'toMatch',
      'toMatchElement',
    ];
    const dialogBtn = await page.$('#dialog-btn');
    await expect(Object.keys(expect(dialogBtn))).toEqual(expect.arrayContaining(elementHandleExpectArray));
    await expect(Object.keys(expect(dialogBtn).not)).toEqual(expect.arrayContaining(elementHandleExpectNotArray));
  });

  test('extendExpectPage async', async () => {
    extendExpectPage('extendPage', async () => {
      return 'extendPage';
    });
    // @ts-ignore
    expect(await expect(page).extendPage()).toBe('extendPage');
  });

  test('extendExpectElementHandle', async () => {
    extendExpectElementHandle('ElementHandle', async () => {
      return 'ElementHandle';
    });
    const body = await page.$('body');
    // @ts-ignore
    expect(await expect(body).ElementHandle()).toBe('ElementHandle');
  });

  test('not', async () => {
    extendExpectPage('not', async () => {
      return 'not';
    }, true);
    // @ts-ignore
    expect(await expect(page).not.not()).toBe('not');
  });
});
