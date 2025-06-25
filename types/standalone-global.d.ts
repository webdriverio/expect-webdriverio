/// <reference types="./standalone.js"/>

// We override the existing one, probably coming from `types/jest`
// @ts-expect-error
declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect
    }
}
