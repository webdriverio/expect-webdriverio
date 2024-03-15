import { toHaveElementProperty } from './toHaveElementProperty.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export function toHaveValue(
    el: WdioElementMaybePromise,
    value: string | RegExp | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    return toHaveElementProperty.call(this, el, 'value', value, options)
}

/**
 * @deprecated
 */
export function toHaveValueContaining(
    el: WdioElementMaybePromise,
    value: string | RegExp | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    return toHaveValue.call(this, el, value, {
        ...options,
        containing: true
    })
}
