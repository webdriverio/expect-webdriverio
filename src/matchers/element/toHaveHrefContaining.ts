import { runExpect } from '../../util/expectAdapter'
import { toHaveHrefFn } from './toHaveHref'

export function toHaveHrefContaining(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveHrefContainingFn, arguments)
}

function toHaveHrefContainingFn(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveHrefFn.call(this, el, href, {
        ...options,
        containing: true
    })
}

export const toHaveLinkContaining = toHaveHrefContaining
