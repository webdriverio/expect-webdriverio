/// <reference types="expect-webdriverio/types/standalone"/>

declare const expectWdio: ExpectWebdriverIO.Expect

declare namespace NodeJS {
    interface Global {
        expectWdio: ExpectWebdriverIO.Expect;
    }
}
