import { toHaveElementProperty } from './toHaveElementProperty.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export function toHaveValue<T>(
    el: WdioElementMaybePromise,
    value: T,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    return toHaveElementProperty.call(this, el, 'value', value, options)
}
