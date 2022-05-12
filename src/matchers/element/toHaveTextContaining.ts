import { toHaveText } from './toHaveText'

export function toHaveTextContaining(el: WebdriverIO.Element, text: string | RegExp | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveText.call(this, el, text, {
        ...options,
        containing: true
    })
}
