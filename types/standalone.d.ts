import { Matchers as ExpectMatchers } from "expect/build/types";
import { ExpectWebdriverIO as ExpectWebdriverIONamespace } from "./expect-webdriverio";

declare namespace ExpectWebdriverIOStandalone {
    interface Matchers<R, T> extends Readonly<ExpectMatchers<R>>, ExpectWebdriverIONamespace.Matchers<R, T> {
        not: ExpectWebdriverIONamespace.Matchers<R, T> & ExpectMatchers<R>
        resolves: ExpectWebdriverIONamespace.Matchers<Promise<R>, T> & ExpectMatchers<Promise<R>>
        rejects: ExpectWebdriverIONamespace.Matchers<Promise<R>, T> & ExpectMatchers<Promise<R>>
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
