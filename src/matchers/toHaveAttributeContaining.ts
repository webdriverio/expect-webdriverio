import { toHaveAttribute } from './toHaveAttribute'

export function toHaveAttributeContaining(el: WebdriverIO.Element, attribute: string, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttribute(el, attribute, value, {
        ...options,
        containing: true
    })
}

export const toHaveAttrContaining = toHaveAttributeContaining
