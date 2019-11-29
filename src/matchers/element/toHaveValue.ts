import { toHaveProperty } from './toHaveProperty'

export function toHaveValue(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveProperty(el, 'value', value, options)
}
