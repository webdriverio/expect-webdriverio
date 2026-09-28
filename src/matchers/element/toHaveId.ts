import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElementArray, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import type { AssertionResult } from 'expect-webdriverio'

/**
 * Element $() API
 */
export async function toHaveId(
    el: WdioElementMaybePromise,
    expectedValue: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Element $$() API
 */
export async function toHaveId(
    el: WdioElementsMaybePromise,
    expectedValue: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Element $() API: shared or one per instance
 */
export async function toHaveId(
    el: WebdriverIO.MultiRemoteElement,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Elements $$() API: shared or one per instance, each maybe one per element
 */
export async function toHaveId(
    el: WebdriverIO.MultiRemoteElement[] | WdioMultiRemoteElementArray,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote Element $() or Elements $$()
 */
export async function toHaveId(
    el: WdioMultiRemoteElements,
    expectedValue: MultiRemoteValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export async function toHaveId(
    this: WdioMatcherContext,
    el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    expectedValue: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { matcherName = 'toHaveId' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const result: ExpectWebdriverIO.AssertionResult = await toHaveAttributeAndValue.call(this, el, 'id', expectedValue, options)

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
