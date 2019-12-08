import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

export function toHaveId(el: WebdriverIO.Element, id: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveIdFn, arguments)
}

export function toHaveIdFn(el: WebdriverIO.Element, id: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttributeFn.call(this, el, 'id', id, options)
}
