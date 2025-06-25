/// <reference types="./types/expect-webdriverio.d.ts"/>

declare namespace jasmine {
    interface AsyncMatchers<T, _U> extends ExpectWebdriverIO.Matchers<Promise<void>, T> {}
}
