import { runExpect } from '../../util/expectAdapter'
import { toHaveHrefFn } from './toHaveHref'

function toHaveHrefContainingFn(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveHrefFn.call(this, el, href, {
        ...options,
        containing: true
    })
}

export function toHaveHrefContaining(...args: any): any {
    return runExpect.call(this || {}, toHaveHrefContainingFn, args)
}

export const toHaveLinkContaining = toHaveHrefContaining
