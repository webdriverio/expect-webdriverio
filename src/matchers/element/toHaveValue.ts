import { toHaveElementProperty } from './toHaveElementProperty.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

export function toHaveValue(
    el: WebdriverIO.Element,
    value: string | RegExp | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    return toHaveElementProperty.call(this, el, 'value', value, options)
}

/**
 * @deprecated
 */
export function toHaveValueContaining(
    el: WebdriverIO.Element,
    value: string | RegExp | ExpectWebdriverIO.PartialMatcher,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    return toHaveValue.call(this, el, value, {
        ...options,
        containing: true
    })
}
