/* eslint-disable @typescript-eslint/consistent-type-imports*/
/// <reference types="./expect-webdriverio.d.ts"/>
/// <reference types="expect"/>

type ExpectAsymmetricMatchers = import('expect').AsymmetricMatchers;
type ExpectBaseExpect = import('expect').BaseExpect;
type ExpectMatchers<R,T> = import('expect').Matchers<R,T>;

// Not exportable from 'expect'
type Inverse<Matchers> = {
  /**
   * Inverse next matcher. If you know how to test something, `.not` lets you test its opposite.
   */
  not: Matchers;
};

declare namespace ExpectWebdriverIO {

    interface Matchers<R, T> extends WdioMatchers<R, T>, ExpectMatchers<R,T> {}

    /**
     * Mostly derived from the types of `jest-expect` but adapted to work with WebdriverIO.
     * @see https://github.com/jestjs/jest/blob/main/packages/jest-expect/src/types.ts
     */
    interface Expect extends ExpectBaseExpect, ExpectAsymmetricMatchers, Inverse<Omit<ExpectAsymmetricMatchers, 'any' | 'anything'>> {
        /**
         * The `expect` function is used every time you want to test a value.
         * You will rarely call `expect` by itself.
         *
         * @param actual The value to apply matchers against.
         */
        <T = unknown>(actual: T): Matchers<void, T> & Inverse<Matchers<void, T>>
    }

    interface InverseAsymmetricMatchers extends Expect {}
}
