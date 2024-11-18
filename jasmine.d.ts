/// <reference types="expect-webdriverio/types/expect-webdriverio"/>

declare namespace jasmine {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface AsyncMatchers<T, U> extends ExpectWebdriverIO.Matchers<Promise<void>, T> {}
}
