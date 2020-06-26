/// <reference types="expect-webdriverio/types/standalone"/>

declare const expectWdio: jest.Expect

declare namespace NodeJS {
    interface Global {
        expectWdio: jest.Expect;
    }
}
