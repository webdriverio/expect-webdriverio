import { toHaveAttributeAndValueFn } from './toHaveAttribute'

export function toHaveAttributeContaining(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeAndValueFn.call(this, el, attribute, value, {
        ...options,
        containing: true
    })
}

export const toHaveAttrContaining = toHaveAttributeContaining
