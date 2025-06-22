/// <reference types="./types/expect-webdriverio.d.ts"/>

declare namespace jasmine {
    interface AsyncMatchers<T> extends CustomMatchers<T> {}
}
