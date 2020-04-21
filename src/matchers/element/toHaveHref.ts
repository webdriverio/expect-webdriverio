import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

export function toHaveHrefFn(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeFn.call(this, el, 'href', href, options)
}

export function toHaveHref(...args: any): any {
    return runExpect.call(this, toHaveHrefFn, args)
}

export const toHaveLink = toHaveHref
