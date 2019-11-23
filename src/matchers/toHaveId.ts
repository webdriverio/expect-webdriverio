import { toHaveAttribute } from './toHaveAttribute'

export function toHaveId(el: WebdriverIO.Element, id: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttribute(el, 'id', id, options)
}
