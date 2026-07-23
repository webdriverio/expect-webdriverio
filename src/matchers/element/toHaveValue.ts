import { toHaveElementProperty } from './toHaveElementProperty.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { AssertionResult } from 'expect-webdriverio'

/**
 * Element $() API
 */
export function toHaveValue(
    el: WdioElementMaybePromise,
    value: string | RegExp | AsymmetricMatcher<string>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

/**
 * Element $$() API
 */
export function toHaveValue(
    el: WdioElementsMaybePromise,
    value: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AssertionResult>

export function toHaveValue(
    el: WdioElementOrArrayMaybePromise,
    value: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
): Promise<AssertionResult>{
    // Using this context, allow better support of signature typing
    const context: { toHaveElementProperty: typeof toHaveElementProperty } = { ...this, toHaveElementProperty: toHaveElementProperty }
    return context.toHaveElementProperty(el, 'value', value, options)
}
