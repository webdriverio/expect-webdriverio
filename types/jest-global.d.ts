/// <reference types="expect-webdriverio/types/standalone"/>

declare const expect: jest.Expect

declare namespace NodeJS {
    interface Global {
        expect: jest.Expect;
    }
}
