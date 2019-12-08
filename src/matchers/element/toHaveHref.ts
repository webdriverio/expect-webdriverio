import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

export function toHaveHref(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveHrefFn, arguments)
}

export function toHaveHrefFn(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttributeFn.call(this, el, 'href', href, options)
}

export const toHaveLink = toHaveHref
