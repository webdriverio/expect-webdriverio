import { toHaveAttributeAndValueFn } from './toHaveAttribute.js'

export function toHaveId(el: WebdriverIO.Element, id: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeAndValueFn.call(this, el, 'id', id, options)
}
