/// <reference types="jest" />

import { ElementHandle, Page, Dialog, NavigationOptions, PageFnOptions, Response, Request, Browser } from "puppeteer";

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

  const browser: Browser;
  const page: Page;

  namespace jest {
    // tslint:disable-next-line no-empty-interface
    interface Matchers<R> {
      // These must all match the ExpectPuppeteer interface above.
      // We can't extend from it directly because some method names conflict in type-incompatible ways.

      toMouseEnter(selector: string, options?: ExpectToClickOptions): Promise<void>;

      toHover(selector: string): Promise<void>;

      toFill(selector: string, value: string, options?: ExpectTimingActions): Promise<void>;

      toMatchElement(selector: string, options?: ExpectToClickOptions): Promise<ElementHandle>;

      toClick(selector: string, options?: ExpectToClickOptions): Promise<void>;
      toDisplayDialog(block: () => Promise<void>): Promise<Dialog>;
      toMatch(selector: string, options?: ExpectTimingActions): Promise<void>;
      toSelect(selector: string, valueOrText: string, options?: ExpectTimingActions): Promise<void>;
      toUploadFile(selector: string, filePath: string, options?: ExpectTimingActions): Promise<void>;

      toWaitFor(
        selectorOrFunctionOrTimeout: string | number | Function,
        options?: any,
        ...args: any[]
      ): Promise<void>;

      toWaitForFunction(
        // fn can be an abritary function
        // tslint:disable-next-line ban-types
        fn: string | Function,
        options?: PageFnOptions,
        ...args: any[]
      ): Promise<any>;

      toWaitForNavigation(options?: NavigationOptions): Promise<Response>;

      toWaitForRequest(
        urlOrPredicate: string | ((req: Request) => boolean),
        options?: { timeout?: number }
      ): Promise<Request>;

      toWaitForResponse(
        urlOrPredicate: string | ((res: Response) => boolean),
        options?: { timeout?: number }
      ): Promise<Response>;

      toWaitForResponseJson(
        urlOrPredicate: string | RegExp | ((res: Response) => boolean),
        options?: { timeout?: number }
      ): Promise<Object>;

      toWaitForSelector(
        selector: string,
        options?: { visible?: boolean; hidden?: boolean; timeout?: number }
      ): Promise<ElementHandle>;

      toWaitForXPath(
        xpath: string,
        options?: { visible?: boolean; hidden?: boolean; timeout?: number }
      ): Promise<ElementHandle>;

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
