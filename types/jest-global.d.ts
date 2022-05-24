/// <reference types="expect-webdriverio/types/standalone"/>

export declare const expect: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expect: ExpectWebdriverIO.Expect;
    }
}
