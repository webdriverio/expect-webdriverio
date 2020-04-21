import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

function toHaveAttributeContainingFn(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeFn.call(this, el, attribute, value, {
        ...options,
        containing: true
    })
}

export function toHaveAttributeContaining(...args: any): any {
    return runExpect.call(this, toHaveAttributeContainingFn, args)
}

export const toHaveAttrContaining = toHaveAttributeContaining
