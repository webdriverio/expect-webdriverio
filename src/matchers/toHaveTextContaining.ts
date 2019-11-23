import { toHaveText } from './toHaveText'

export function toHaveTextContaining(el: WebdriverIO.Element, text: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveText(el, text, {
        ...options,
        containing: true
    })
}
