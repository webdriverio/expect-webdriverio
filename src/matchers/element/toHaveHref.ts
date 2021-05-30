import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeAndValueFn } from './toHaveAttribute'

export function toHaveHrefFn(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeAndValueFn.call(this, el, 'href', href, options)
}

export function toHaveHref(...args: any): any {
    return runExpect.call(this, toHaveHrefFn, args)
}

export const toHaveLink = toHaveHref
