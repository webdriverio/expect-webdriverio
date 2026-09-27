import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElementArray, WdioMultiRemoteElements } from '../../types.js'
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
    el: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray,
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
    el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {

    await options.beforeAssertion?.({
        matcherName: 'toHaveHref',
        expectedValue,
        options,
    })

    const result = await toHaveAttributeAndValue.call(this, el, 'href', expectedValue, options)

    await options.afterAssertion?.({
        matcherName: 'toHaveHref',
        expectedValue,
        options,
        result
    })

    return result
}

export const toHaveLink = toHaveHref
