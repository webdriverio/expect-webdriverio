/// <reference types="./expect-webdriverio.d.ts"/>

/**
 * Global declaration file for WebdriverIO's Expect library when not pair with another expect library like Jest. or Jasmine.
 * One example is mocha without the chai expect library.
 */

//// @ts-expect-error: IDE might flags this one but just does be concerned by it. This way the `tsc:root-types` can pass!
declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect
    }
}
