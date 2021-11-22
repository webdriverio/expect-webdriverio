import { ExpectWebdriverIO as ExpectWebdriverIONamespace } from "./expect-webdriverio";

export declare namespace ExpectWebdriverIOStandalone {
    interface Matchers<R, T> extends Readonly<import('expect/build/types').Matchers<R>> {
        not: Matchers<R, T>
        resolves: Matchers<Promise<R>, T>
        rejects: Matchers<Promise<R>, T>
    }

    type Expect = {
        <T = unknown>(actual: T): Matchers<T, T>
        extend(map: Record<string, Function>): void
    } & AsymmetricMatchers

    type AsymmetricMatchers = {
        any(expectedObject: any): ExpectWebdriverIONamespace.PartialMatcher
        anything(): ExpectWebdriverIONamespace.PartialMatcher
        arrayContaining(sample: Array<unknown>): ExpectWebdriverIONamespace.PartialMatcher
        objectContaining(sample: Record<string, unknown>): ExpectWebdriverIONamespace.PartialMatcher
        stringContaining(expected: string): ExpectWebdriverIONamespace.PartialMatcher
        stringMatching(expected: string | RegExp): ExpectWebdriverIONamespace.PartialMatcher
        not: AsymmetricMatchers
    }
}
