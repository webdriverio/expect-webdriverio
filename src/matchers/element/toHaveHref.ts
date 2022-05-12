import { toHaveAttributeAndValueFn } from './toHaveAttribute'

export function toHaveHref(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeAndValueFn.call(this, el, 'href', href, options)
}

export const toHaveLink = toHaveHref
