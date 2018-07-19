import 'expect-puppeteer';
import { MAGIC_SNAPSHOT, imagePath, STUB_MESSAGE } from '../constants';
const getPuppeteerType = require('expect-puppeteer/lib/utils').getPuppeteerType;
const getState = require('expect/build/jest_matchers_object').getState;
import * as path from 'path';
import { randomString } from '../util';

const puppeteerMatchers = {
  'toClick': 0,
  'toDisplayDialog': 0,
  'toFill': 0,
  'toFillForm': 0,
  'toMatch': 0,
  'toMatchElement': 0,
  'toSelect': 0,
  'toUploadFile': 0,
  'not': {
    'toMatch': 0,
    'toMatchElement': 0,
  },
};

const wapperMathers = {
  toWaitFor: 'waitFor',
  toWaitForFunction: 'waitForFunction',
  toWaitForNavigation: 'waitForNavigation',
  toWaitForRequest: 'waitForRequest',
  toWaitForResponse: 'waitForResponse',
  toWaitForSelector: 'waitForSelector',
  toWaitForXPath: 'waitForXPath',
  toGoto: 'goto',
  toGoBack: 'goBack',
  toGoForward: 'goForward',
};

async function createScreenshot(_context, actual, error) {
  const screenshot = randomString() + '.png';
  await actual.screenshot({ path: path.join(imagePath, screenshot) });
  error.stack += `\n${MAGIC_SNAPSHOT}=${screenshot}`;
}

function createMatcher(context, actual, matcher) {
  return async function throwingMatcher(...args) {
    const err = new Error(STUB_MESSAGE);
    Error.captureStackTrace(err, throwingMatcher);
    try {
      return await matcher(...args);
    } catch (error) {
      err.stack = err.stack!.replace(STUB_MESSAGE, error.message);
      err.message = err.message.replace(STUB_MESSAGE, error.message);
      await createScreenshot(context, actual, err);
      throw err;
    }
  };
}

// @ts-ignore
if (typeof global.expect !== 'undefined') {
  // @ts-ignore
  const originalExpect = global.expect;
  // @ts-ignore
  global.expect = (actual, ...args) => {
    const matchers = originalExpect(actual, ...args);
    const context = getState();
    const type = getPuppeteerType(actual);
    if (type == null) {
      return matchers;
    }
    Object.keys(puppeteerMatchers).forEach(key => {
      if (key === 'not') { return; }
      if (matchers[key]) {
        matchers[key] = createMatcher(context, actual, matchers[key]);
      }
    });

    Object.keys(puppeteerMatchers.not).forEach(key => {
      if (matchers.not[key]) {
        matchers.not[key] = createMatcher(context, actual, matchers.not[key]);
      }
    });

    if (type === 'Page') {
      Object.keys(wapperMathers).map(newMatcher => {
        matchers[newMatcher] = async function throwingMatcher(...args1) {
          const err = new Error(STUB_MESSAGE);
          Error.captureStackTrace(err, throwingMatcher);
          try {
            return await actual[wapperMathers[newMatcher]](...args1);
          } catch (error) {
            err.stack = err.stack!.replace(STUB_MESSAGE, error.message);
            err.message = err.message.replace(STUB_MESSAGE, error.message);
            throw err;
          }
        };
      });
    }
    return matchers;
  };
  // 还原expect的属性
  Object.keys(originalExpect).forEach(prop => {
    // @ts-ignore
    global.expect[prop] = originalExpect[prop];
  });
}
