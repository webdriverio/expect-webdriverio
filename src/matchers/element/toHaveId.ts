import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

export function toHaveIdFn(el: WebdriverIO.Element, id: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeFn.call(this, el, 'id', id, options)
}

export function toHaveId(...args: any): any {
    return runExpect.call(this, toHaveIdFn, args)
}
