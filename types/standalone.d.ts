/// <reference types="./expect-webdriverio.js"/>

type ChainablePromiseElement = import('webdriverio').ChainablePromiseElement<WebdriverIO.Element>
type ChainablePromiseArray = import('webdriverio').ChainablePromiseArray<WebdriverIO.Element>

declare namespace ExpectWebdriverIO {
    interface Matchers<R extends void | Promise<void>, T> extends Readonly<import('expect').Matchers<R>> {
        not: Matchers<R, T>
        resolves: Matchers<R, T>
        rejects: Matchers<R, T>
    }

    type Expect = {
        <T = unknown, R extends void | Promise<void> = void | Promise<void>>(actual: T): Matchers<R, T>
        extend(map: Record<string, Function>): void
    } & AsymmetricMatchers

    type AsymmetricMatchers = {
        any(expectedObject: any): PartialMatcher
        anything(): PartialMatcher
        arrayContaining(sample: Array<unknown>): PartialMatcher
        objectContaining(sample: Record<string, unknown>): PartialMatcher
        stringContaining(expected: string): PartialMatcher
        stringMatching(expected: string | RegExp): PartialMatcher
        not: AsymmetricMatchers
    }
}
