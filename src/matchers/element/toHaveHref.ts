import { toHaveAttribute } from './toHaveAttribute'

export function toHaveHref(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttribute(el, 'href', href, options)
}

export const toHaveLink = toHaveHref
