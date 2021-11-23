import { ExpectWebdriverIOStandalone } from "./standalone";

/**
 * to use as an additional expectation lib (not recommended)
 */
declare const expectWdio: ExpectWebdriverIOStandalone.Expect

declare namespace NodeJS {
    interface Global {
        expectWdio: ExpectWebdriverIOStandalone.Expect;
    }
}
