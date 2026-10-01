import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElementArray, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { AssertionResult } from 'expect-webdriverio'

/**
 * Elemment $() APi
 */
export async function toHaveHref(
    el: WdioElementMaybePromise,
    expectedValue: MaybeOneOf<string | RegExp | WdioAsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Element $$() API
 */
export async function toHaveHref(
    el: WdioElementsMaybePromise,
    expectedValue: MaybeArrayOrOneOf<string | RegExp | WdioAsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Element $() API: shared or one per instance
 */
export async function toHaveHref(
    el: WebdriverIO.MultiRemoteElement,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | WdioAsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Elements $$() API: shared or one per instance, each maybe one per element
 */
export async function toHaveHref(
    el: WdioMultiRemoteElementArray,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | WdioAsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Element $() or Elements $$()
 */
export async function toHaveHref(
    el: WdioMultiRemoteElements,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | WdioAsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export async function toHaveHref(
    this: WdioMatcherContext,
    el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { matcherName = 'toHaveHref' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const result = await toHaveAttributeAndValue.call(this, el, 'href', expectedValue, options)

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}

/**
 * Alias of `toHaveHref`, with its own name in the `beforeAssertion` and `afterAssertion` hooks
 */
export const toHaveLink: typeof toHaveHref = function toHaveLink(this: WdioMatcherContext, ...args: unknown[]): Promise<AssertionResult> {
    return (toHaveHref as (this: WdioMatcherContext, ...args: unknown[]) => Promise<AssertionResult>).call({ matcherName: 'toHaveLink', ...this }, ...args)
}
