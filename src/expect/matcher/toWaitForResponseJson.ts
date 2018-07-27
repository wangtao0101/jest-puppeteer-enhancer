import { Page } from 'puppeteer';
import { isString, isRegExp } from '../../util';

/**
 * wait for a success response, return response.json()
 * @param instance Page
 * @param urlRegOrPredicate url string or url regexp or Predicate
 */
async function toWaitForResponseJson(instance: Page, urlRegOrPredicate, options) {
  const re = await instance.waitForResponse(response => {
    if (isString(urlRegOrPredicate)) {
      return response.status() === 200 && urlRegOrPredicate === response.url();
    } else if (isRegExp(urlRegOrPredicate)) {
      return response.status() === 200 && urlRegOrPredicate.test(response.url());
    } else if (typeof urlRegOrPredicate === 'function') {
      return response.status() === 200 && !!(urlRegOrPredicate(response));
    }
    return false;
  }, options);
  return await re.json();
}

export default toWaitForResponseJson;
