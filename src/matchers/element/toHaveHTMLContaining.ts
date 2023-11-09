import { toHaveHTML } from './toHaveHTML.js'

export function toHaveHTMLContaining(el: WebdriverIO.Element, html: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.HTMLOptions = {}) {
    return toHaveHTML.call(this, el, html, {
        ...options,
        containing: true
    })
}
