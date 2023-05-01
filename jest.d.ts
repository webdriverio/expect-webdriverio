/// <reference types="./types/expect-webdriverio.d.ts"/>

declare namespace jest {
    interface Matchers<R, T> extends ExpectWebdriverIO.Matchers<R, T> { }
}
