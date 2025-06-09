/// <reference types="./expect-webdriverio.js"/>

type PromiseLikeExpect = WebdriverIO.Browser | WebdriverIO.Element | WebdriverIO.MultiRemoteBrowser | WebdriverIO.MultiRemoteElement
type WdioPromiseLikeExpect = WebdriverIO.Browser | WebdriverIO.Element | WebdriverIO.MultiRemoteBrowser | WebdriverIO.MultiRemoteElement | ReturnType<WebdriverIO.Browser['$']> |ReturnType<WebdriverIO.Browser['$$']>

declare namespace ExpectWebdriverIO {
    interface Matchers<R = T extends WdioPromiseLikeExpect ? Promise<void> : void> extends Readonly<import('expect').Matchers<R>> {
        not: Matchers<R, T>
        // TODO when type is promise the below are incorrect
        resolves: Matchers<R, T>
        rejects: Matchers<R, T>
    }

    /**
     * expect function declaration, containing two generics:
     *  - T: the type of the actual value, e.g. WebdriverIO.Browser or WebdriverIO.Element
     *  - R: the type of the return value, e.g. Promise<void> or void
     */
    type Expect = {
        <T = unknown, R = T extends WdioPromiseLikeExpect ? Promise<void> : void>(actual: T): Matchers<R, T>
        extend(map: Record<string, Function>): void
    } & AsymmetricMatchers

    interface AsymmetricMatchers {
        any(expectedObject: any): PartialMatcher
        anything(): PartialMatcher
        arrayContaining(sample: Array<unknown>): PartialMatcher
        objectContaining(sample: Record<string, unknown>): PartialMatcher
        stringContaining(expected: string): PartialMatcher
        stringMatching(expected: string | RegExp | ExpectWebdriverIO.PartialMatcher): PartialMatcher
        not: AsymmetricMatchers
    }
}
