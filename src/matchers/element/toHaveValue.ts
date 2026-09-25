import { toHaveElementProperty } from './toHaveElementProperty.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise, WdioMultiRemoteElements } from '../../types.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { AssertionResult } from 'expect-webdriverio'

/**
 * Element $() API
 */
export function toHaveValue(
    el: WdioElementMaybePromise,
    value: MaybeOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Element $$() API
 */
export function toHaveValue(
    el: WdioElementsMaybePromise,
    value: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Multi-Remote $() or $$() API: one expected value for every instance, or one per instance
 */
export function toHaveValue(
    el: WdioMultiRemoteElements,
    value: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export function toHaveValue(
    el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    value: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult>{
    // The value is a string, so a plain object is the multi-remote per-instance shorthand, not a literal value
    return (toHaveElementProperty as ToHaveElementPropertyFn).call({ ...this, allowObjectExpectedValue: false }, el, 'value', value, options)
}

// toHaveElementProperty.call does not respect well the tsc so using the below workaround to make it work with the correct typing.
type ToHaveElementPropertyFn = (
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    property: string,
    value: MaybeArrayOrMultiRemoteWithArrayValuesOrOneOf<string | number | RegExp | AsymmetricMatcher<string> | null> | ExpectWebdriverIO.StringOptions | undefined,
    options?: ExpectWebdriverIO.StringOptions
) => Promise<AssertionResult>
