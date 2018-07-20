/// <reference types="jest" />

import { ElementHandle, Page, Dialog, NavigationOptions } from "puppeteer";

type ExpectPolling = number | "mutation" | "raf";

interface ExpectTimingActions {
  /**
   * An interval at which the pageFunction is executed. Defaults to "raf".
   */
  polling?: ExpectPolling;

  /**
   * Maximum time to wait for in milliseconds. Defaults to 500.
   */
  timeout?: number;

  /**
   * delay for page.type
   */
  delay?: number;
}

interface ExpectToClickOptions extends ExpectTimingActions {
  /**
   * A text or a RegExp to match in element textContent.
   */
  text?: string | RegExp;
}

declare global {
  namespace jest {
    // tslint:disable-next-line no-empty-interface
    interface Matchers<R> {
      // These must all match the ExpectPuppeteer interface above.
      // We can't extend from it directly because some method names conflict in type-incompatible ways.

      toHover(selector: string, options?: ExpectToClickOptions): Promise<void>;

      toFill(selector: string, value: string, options?: ExpectTimingActions): Promise<void>;

      toWaitFor(
        selectorOrFunctionOrTimeout: string | number | Function,
        options?: any,
        ...args: any[]
      ): Promise<void>;

      toWaitForNavigation(options?: NavigationOptions): Promise<Response>;

      /**
     * Navigate to the previous page in history.
     * @param options The navigation parameters.
     */
      toGoBack(options?: Partial<NavigationOptions>): Promise<Response | null>;

      /**
       * Navigate to the next page in history.
       * @param options The navigation parameters.
       */
      toGoForward(options?: Partial<NavigationOptions>): Promise<Response | null>;

      /**
       * Navigates to a URL.
       * @param url URL to navigate page to. The url should include scheme, e.g. `https://`
       * @param options The navigation parameters.
       */
      toGoto(url: string, options?: Partial<NavigationOptions>): Promise<Response | null>;
    }
  }
}
