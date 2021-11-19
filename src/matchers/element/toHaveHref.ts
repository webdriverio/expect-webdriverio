import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeAndValueFn } from './toHaveAttribute'

export function toHaveHrefFn(el: WebdriverIO.Element, href: string, options: ExpectWebdriverIO.StringOptions = {}, driver?: WebdriverIO.Browser): any {
    return toHaveAttributeAndValueFn.call(this, el, 'href', href, options, driver)
}

export function toHaveHref(...args: any): any {
    return runExpect.call(this, toHaveHrefFn, args)
}

export const toHaveLink = toHaveHref
