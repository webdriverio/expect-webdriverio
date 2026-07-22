import { toHaveElementProperty } from './toHaveElementProperty.js'
import type { WdioElementMaybePromise, WdioElementOrArrayMaybePromise, WdioElementsMaybePromise } from '../../types.js'
import type { AsyncAssertionResult } from 'expect-webdriverio'

export function toHaveValue(
    el: WdioElementMaybePromise,
    value: string | RegExp | AsymmetricMatcher<string>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

export function toHaveValue(
    el: WdioElementsMaybePromise,
    value: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>

export function toHaveValue(
    el: WdioElementOrArrayMaybePromise,
    value: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options?: ExpectWebdriverIO.StringOptions
): Promise<AsyncAssertionResult>{
    // Using this context, allow better support of signature typing
    const context: { toHaveElementProperty: typeof toHaveElementProperty } = { ...this, toHaveElementProperty: toHaveElementProperty }
    return context.toHaveElementProperty(el, 'value', value, options)
}
