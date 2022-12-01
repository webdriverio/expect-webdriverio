/// <reference types="expect-webdriverio/types/expect-webdriverio"/>

declare module jasmine {
    interface AsyncMatchers<T, U> extends ExpectWebdriverIO.Matchers<Promise<void>, T> {}
}
