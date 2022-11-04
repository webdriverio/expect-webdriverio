import { toHaveAttributeAndValueFn } from './toHaveAttribute.js'

export function toHaveHref(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttributeAndValueFn.call(this, el, 'href', href, options)
}

export const toHaveLink = toHaveHref
