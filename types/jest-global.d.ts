/// <reference types="expect-webdriverio/types/jest-expect-clone/jest-expect"/>
/// <reference types="expect-webdriverio/jest"/>

declare const expect: jest.Expect

declare namespace NodeJS {
    interface Global {
        expect: jest.Expect
    }
}
