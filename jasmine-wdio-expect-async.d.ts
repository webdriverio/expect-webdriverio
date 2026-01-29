/// <reference types="./types/expect-webdriverio.d.ts"/>

/**
 * Overrides the default WDIO expect specifically for Jasmine, since `expectAsync` is forced into `expect`, making all matchers fully asynchronous. This is not the case under Jest or Mocha.
 */
declare namespace ExpectWebdriverIO {
    interface Expect extends ExpectWebdriverIO.AsymmetricMatchers, ExpectLibInverse<ExpectWebdriverIO.InverseAsymmetricMatchers>, WdioExpect {
        /**
         * The `expect` function is used every time you want to test a value.
         * You will rarely call `expect` by itself.
         *
         * expect function declaration contains two generics:
         *  - T: the type of the actual value, e.g. any type, not just WebdriverIO.Browser or WebdriverIO.Element
         *  - R: the type of the return value, e.g. Promise<void> or void
         *
         * Note: The function must stay here in the namespace to overwrite correctly the expect function from the expect library.
         *
         * @param actual The value to apply matchers against.
         */
        <T = unknown>(actual: T): ExpectWebdriverIO.MatchersAndInverse<Promise<void>, T>
    }
}
