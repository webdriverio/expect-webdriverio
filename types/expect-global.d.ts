/// <reference types="./expect-webdriverio.d.ts"/>

/**
 * Global declaration file for WebdriverIO's Expect library to force the expect.
 * Required when used in standalone mode (mocha) or to override the one of Jasmine
 */

//// @ts-expect-error: IDE might flags this one but just does be concerned by it. This way the `tsc:root-types` can pass!
declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect
    }
}