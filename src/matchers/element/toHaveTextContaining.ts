import { toHaveText } from './toHaveText.js'

export function toHaveTextContaining(el: WebdriverIO.Element, text: string | RegExp | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveText.call(this, el, text, {
        ...options,
        containing: true
    })
}
