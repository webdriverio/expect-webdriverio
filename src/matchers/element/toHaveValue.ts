import { toHaveElementProperty } from './toHaveElementProperty.js'
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

export function toHaveValue(
    this: WdioMatcherContext,
    el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    value: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult>{
    // The value is a string, so a plain object is the multi-remote per-instance shorthand, not a literal value
    return (toHaveElementProperty as ToHaveElementPropertyFn).call({ matcherName: 'toHaveValue', ...this, allowObjectExpectedValue: false }, el, 'value', value, options)
}

// toHaveElementProperty.call does not respect well the tsc so using the below workaround to make it work with the correct typing.
type ToHaveElementPropertyFn = (
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    property: string,
    value: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | number | RegExp | AsymmetricMatcher<string> | null> | StringOptions | undefined,
    options?: StringOptions
) => Promise<AssertionResult>
