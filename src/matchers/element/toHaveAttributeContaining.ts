import { toHaveAttributeAndValueFn } from './toHaveAttribute.js'

export function toHaveAttributeContaining(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttributeAndValueFn.call(this, el, attribute, value, {
        ...options,
        containing: true
    })
}

export const toHaveAttrContaining = toHaveAttributeContaining
