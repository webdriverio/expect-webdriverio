/* eslint-disable @typescript-eslint/consistent-type-imports*/
/// <reference types="./expect-webdriverio.js"/>

type ChainablePromiseElement = import('webdriverio').ChainablePromiseElement
type ChainablePromiseArray = import('webdriverio').ChainablePromiseArray

declare namespace ExpectWebdriverIO {
    interface Matchers<R extends void | Promise<void>, T> extends Readonly<import('expect').Matchers<R>> {
        not: Matchers<R, T>
        resolves: Matchers<R, T>
        rejects: Matchers<R, T>
    }

    /**
     * expect function declaration, containing two generics:
     *  - T: the type of the actual value, e.g. WebdriverIO.Browser or WebdriverIO.Element
     *  - R: the type of the return value, e.g. Promise<void> or void
     */
    type Expect = {
        <T = unknown, R extends void | Promise<void> = void | Promise<void>>(actual: T): Matchers<R, T>
        extend(map: Record<string, Function>): void
    } & AsymmetricMatchers

    interface AsymmetricMatchers {
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        any(expectedObject: any): PartialMatcher
        anything(): PartialMatcher
        arrayContaining(sample: Array<unknown>): PartialMatcher
        objectContaining(sample: Record<string, unknown>): PartialMatcher
        stringContaining(expected: string): PartialMatcher
        stringMatching(expected: string | RegExp | ExpectWebdriverIO.PartialMatcher): PartialMatcher
        not: AsymmetricMatchers
    }
}
