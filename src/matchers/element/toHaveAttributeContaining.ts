import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeAndValueFn } from './toHaveAttribute'

function toHaveAttributeContainingFn(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions = {}, driver?: WebdriverIO.Browser): any {
    return toHaveAttributeAndValueFn.call(this, el, attribute, value, {
        ...options,
        containing: true
    }, driver)
}

export function toHaveAttributeContaining(...args: any): any {
    return runExpect.call(this, toHaveAttributeContainingFn, args)
}

export const toHaveAttrContaining = toHaveAttributeContaining
