import { toHaveComputedLabel } from './toHaveComputedLabel.js'

export function toHaveComputedLabelContaining(el: WebdriverIO.Element, label: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveComputedLabel.call(this, el, label, {
        ...options,
        containing: true
    })
}
