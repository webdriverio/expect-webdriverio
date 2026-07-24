import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import type { AssertionResult } from 'expect-webdriverio'

/**
 * Element $() API
 */
export async function toHaveId(
    el: WdioElementMaybePromise,
    expectedValue: string | RegExp | AsymmetricMatcher<string>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Element $$() API
 */
export async function toHaveId(
    el: WdioElementsMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export async function toHaveId(
    el: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    await options.beforeAssertion?.({
        matcherName: 'toHaveId',
        expectedValue,
        options,
    })

    const result: ExpectWebdriverIO.AssertionResult = await toHaveAttributeAndValue.call(this, el, 'id', expectedValue, options)

    await options.afterAssertion?.({
        matcherName: 'toHaveId',
        expectedValue,
        options,
        result
    })

    return result
}
