import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeAndValueFn } from './toHaveAttribute'

export function toHaveIdFn(el: WebdriverIO.Element, id: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeAndValueFn.call(this, el, 'id', id, options)
}

export function toHaveId(...args: any): any {
    return runExpect.call(this || {}, toHaveIdFn, args)
}
