/// <reference path="../lib/index.d.ts"/>

/**
 * Global declaration file for WebdriverIO's Expect library to force the expect.
 * Required when used in standalone mode (mocha) or to override the one of Jasmine
 */

// @ts-ignore, not @ts-expect-error: only a conflict when the Jasmine `expect` is also loaded
declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect
    }
}
