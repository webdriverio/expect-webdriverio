/// <reference types="./expect-webdriverio.d.ts"/>

/**
 * Global declaration file for WebdriverIO's Expect library when not pair with another expect library like Jest. or Jasmine.
 * One example is mocha without the chai expect library.
 */

// We override the existing one, probably coming from `types/jest`
// @ts-expect-error
declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect
    }
}
