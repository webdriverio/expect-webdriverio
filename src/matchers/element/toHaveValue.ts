import { toHaveElementProperty } from './toHaveElementProperty.js'

export function toHaveValue(
    el: WebdriverIO.Element,
    value: string | RegExp,
    options: ExpectWebdriverIO.StringOptions = {}
) {
    return toHaveElementProperty.call(this, el, 'value', value, options)
}
