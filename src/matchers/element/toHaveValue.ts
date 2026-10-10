import { toHaveElementPropertyAndValue } from './toHaveElementProperty.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements, WdioMatcherContext } from '../../types.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { AssertionResult, StringOptions } from '../../publicTypes/options.js'

/**
 * Element $() API
 */
export function toHaveValue(
    el: WdioElementMaybePromise,
    value: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Element $$() API
 */
export function toHaveValue(
    el: WdioElementsMaybePromise,
    value: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote $() or $$() API: one expected value for every instance, or one per instance
 */
export function toHaveValue(
    el: WdioMultiRemoteElements,
    value: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: StringOptions
): Promise<AssertionResult>

export async function toHaveValue(
    this: WdioMatcherContext,
    el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    value: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult> {
    const { matcherName = 'toHaveValue' } = this

    // The value alone, as `toHaveId`: `'value'` is an internal argument of the getter
    await options.beforeAssertion?.({
        matcherName,
        expectedValue: value,
        options,
    })

    // The value is a string, so a plain object is the multi-remote per-instance shorthand, not a literal value
    const result = await toHaveElementPropertyAndValue.call({ ...this, matcherName, allowObjectExpectedValue: false }, el, 'value', value, options)

    await options.afterAssertion?.({
        matcherName,
        expectedValue: value,
        options,
        result
    })

    return result
}
