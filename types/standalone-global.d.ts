/// <reference types="expect-webdriverio/types/standalone"/>

/**
 * to use as an additional expectation lib (not recommended)
 */
declare const expectWdio: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expectWdio: ExpectWebdriverIO.Expect;
    }
}
