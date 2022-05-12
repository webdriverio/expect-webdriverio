import { toHaveElementProperty } from './toHaveElementProperty'

export function toHaveValue(
    el: WebdriverIO.Element,
    value: string | RegExp,
    options: ExpectWebdriverIO.StringOptions = {}
): any {
    return toHaveElementProperty.call(this, el, 'value', value, options)
}
