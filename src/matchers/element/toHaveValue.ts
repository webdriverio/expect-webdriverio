import { toHaveElementProperty } from './toHaveElementProperty.js'
import type { WdioElementMaybePromise, MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements, WdioElementsMaybePromise } from '../../types.js'
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

export function toHaveValue(
    el: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    value: MaybeArrayOrOneOf<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult>{
    return (toHaveElementProperty as ToHaveElementPropertyFn).call(this, el, 'value', value, options)
}

// toHaveElementProperty.call does not respect well the tsc so using the below workaround to make it work with the correct typing.
type ToHaveElementPropertyFn = (
    received: MaybeSomeWdioElementOrArrayMaybePromiseOrMultiRemoteElements,
    property: string,
    value: MaybeArrayOrOneOf<string | number | RegExp | AsymmetricMatcher<string> | null> | ExpectWebdriverIO.StringOptions | undefined,
    options?: ExpectWebdriverIO.StringOptions
) => Promise<AssertionResult>
