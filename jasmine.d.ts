/// <reference types="expect-webdriverio/types/expect-webdriverio"/>

declare module jasmine {
    interface Matchers<T> extends ExpectWebdriverIO.Matchers {}
}
