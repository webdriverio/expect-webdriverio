/// <reference types="./types/expect-webdriverio.d.ts"/>

declare namespace jest {

    interface Matchers<R, T> extends CustomMatchers<R, T>{}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Expect extends CustomMatchers<any> {}

    interface InverseAsymmetricMatchers extends Expect {}
}