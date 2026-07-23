import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import type { AssertionResult } from 'expect-webdriverio'

/**
 * Elemment $() APi
 */
export async function toHaveHref(
    el: WdioElementMaybePromise,
    expectedValue: string | RegExp | WdioAsymmetricMatcher<string>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Element $$() API
 */
export async function toHaveHref(
    el: WdioElementsMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export async function toHaveHref(
    el: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
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
