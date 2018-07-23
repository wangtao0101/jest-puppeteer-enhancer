import 'expect-puppeteer';
import { MAGIC_SNAPSHOT, imagePath, STUB_MESSAGE } from '../constants';
const getPuppeteerType = require('expect-puppeteer/lib/utils').getPuppeteerType;
const getState = require('expect/build/jest_matchers_object').getState;
import notToMatch from 'expect-puppeteer/lib/matchers/notToMatch';
import notToMatchElement from 'expect-puppeteer/lib/matchers/notToMatchElement';
import toClick from 'expect-puppeteer/lib/matchers/toClick';
import toDisplayDialog from 'expect-puppeteer/lib/matchers/toDisplayDialog';
import toFill from 'expect-puppeteer/lib/matchers/toFill';
import toFillForm from 'expect-puppeteer/lib/matchers/toFillForm';
import toMatch from 'expect-puppeteer/lib/matchers/toMatch';
import toMatchElement from 'expect-puppeteer/lib/matchers/toMatchElement';
import toSelect from 'expect-puppeteer/lib/matchers/toSelect';
import toUploadFile from 'expect-puppeteer/lib/matchers/toUploadFile';
import * as path from 'path';
import { randomString } from '../util';
import toHover from './matcher/toHover';
import toMouseEnter from './matcher/toMouseEnter';

const pageMatchers = {
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
  toMouseEnter,
  toHover,
  toClick,
  toDisplayDialog,
  toFill,
  toFillForm,
  toMatch,
  toMatchElement,
  toSelect,
  toUploadFile,
  not: {
    toMatch: notToMatch,
    toMatchElement: notToMatchElement,
  },
};

const elementHandleMatchers = {
  toHover,
  toClick,
  toFill,
  toFillForm,
  toMatch,
  toMatchElement,
  toSelect,
  toUploadFile,
  not: {
    toMatch: notToMatch,
    toMatchElement: notToMatchElement,
  },
};

async function createScreenshot(_context, actual, error) {
  const screenshot = randomString() + '.png';
  await actual.screenshot({ path: path.join(imagePath, screenshot) });
  error.stack += `\n${MAGIC_SNAPSHOT}=${screenshot}`;
}

function createMatcher(context, actual, matcher) {
  return async function throwingMatcher(...args) {
    // @ts-ignore
    if (typeof global.expect !== 'undefined') {
      // @ts-ignore
      global.expect.getState().assertionCalls += 1;
    }

    if (typeof matcher === 'string') {
      const type = matcher;
      matcher = async function (innerActual, ...innterArgs) {
        return await innerActual[type](...innterArgs);
      };
    }

    const err = new Error(STUB_MESSAGE);
    Error.captureStackTrace(err, throwingMatcher);
    try {
      return await matcher(actual, ...args);
    } catch (error) {
      err.stack = err.stack!.replace(STUB_MESSAGE, error.message);
      err.message = err.message.replace(STUB_MESSAGE, error.message);
      try {
        await createScreenshot(context, actual, err);
      } finally {
        throw err;
      }
    }
  };
}

function internalExpect(context, actual, matchers) {
  const expectation = {
    not: {},
  };

  Object.keys(matchers).forEach(key => {
    if (key === 'not') { return; }
    expectation[key] = createMatcher(context, actual, matchers[key]);
  });

  Object.keys(matchers.not).forEach(key => {
    expectation.not[key] = createMatcher(context, actual, matchers.not[key]);
  });

  return expectation;
}

function expectPuppeteer(context, actual) {
  const type = getPuppeteerType(actual);
  switch (type) {
    case 'Page':
      return internalExpect(context, actual, pageMatchers);
    case 'ElementHandle':
      return internalExpect(context, actual, elementHandleMatchers);
    default:
      throw new Error(`${actual} is not supported`);
  }
}

// @ts-ignore
if (typeof global.expect !== 'undefined') {
  // @ts-ignore
  const originalExpect = global.expect;
  const context = getState();
  // @ts-ignore
  global.expect = (actual, ...args) => {
    const type = getPuppeteerType(actual);
    if (type) {
      const matchers = expectPuppeteer(context, actual);
      const jestMatchers = originalExpect(actual, ...args);
      return {
        ...jestMatchers,
        ...matchers,
        not: {
          ...jestMatchers.not,
          ...matchers.not,
        },
      };
    }
    return originalExpect(actual, ...args);
  };
  Object.keys(originalExpect).forEach(prop => {
    // @ts-ignore
    global.expect[prop] = originalExpect[prop];
  });
}
