/// <reference types="expect-webdriverio/types/expect-webdriverio"/>

declare namespace jest {
    interface Matchers<R, T> extends ExpectWebdriverIO.Matchers<R, T> { }
}
