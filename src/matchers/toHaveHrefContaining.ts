import { toHaveHref } from './toHaveHref'

export function toHaveHrefContaining(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveHref(el, href, {
        ...options,
        containing: true
    })
}

export const toHaveLinkContaining = toHaveHrefContaining
