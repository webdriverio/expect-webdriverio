/// <reference types="./standalone.js"/>

// On IDE restart, it seems to conflict with one defined in `types/jest`
// @ts-ignore
declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect
    }
}
