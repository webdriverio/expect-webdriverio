import { toHaveValue } from './toHaveValue.js'

export function toHaveValueContaining(el: WebdriverIO.Element, value: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveValue.call(this, el, value, {
        ...options,
        containing: true
    })
}
