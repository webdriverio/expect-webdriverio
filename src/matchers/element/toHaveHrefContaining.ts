import { toHaveHref } from './toHaveHref'

export function toHaveHrefContaining(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveHref.call(this, el, href, {
        ...options,
        containing: true
    })
}

export const toHaveLinkContaining = toHaveHrefContaining
