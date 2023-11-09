import { toHaveValue } from './toHaveValue.js'

export function toHaveValueContaining(el: WebdriverIO.Element, value: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveValue.call(this, el, value, {
        ...options,
        containing: true
    })
}
