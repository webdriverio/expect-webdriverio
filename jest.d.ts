/// <reference types="./types/expect-webdriverio.d.ts"/>

declare namespace jest {
    // noinspection JSUnusedGlobalSymbols
    interface Matchers<R> extends CustomMatchers<R>{}

    // noinspection JSUnusedGlobalSymbols

    interface Expect extends CustomMatchers {}

    // noinspection JSUnusedGlobalSymbols

    interface InverseAsymmetricMatchers extends Expect {}
}