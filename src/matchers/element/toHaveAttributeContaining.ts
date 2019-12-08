import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

export function toHaveAttributeContaining(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveAttributeContainingFn, arguments)
}

function toHaveAttributeContainingFn(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttributeFn.call(this, el, attribute, value, {
        ...options,
        containing: true
    })
}

export const toHaveAttrContaining = toHaveAttributeContaining
