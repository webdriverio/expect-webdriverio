/// <reference types="./types/expect-webdriverio.d.ts"/>

declare namespace jasmine {
    interface AsyncMatchers<T, R> extends WdioCustomMatchers<R, T> {}
}
