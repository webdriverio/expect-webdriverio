import { runExpect } from '../../util/expectAdapter'
import { toHaveElementPropertyFn } from './toHaveElementProperty'

export function toHaveValueFn(el: WebdriverIO.Element, value: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveElementPropertyFn.call(this, el, 'value', value, options)
}

export function toHaveValue(...args: any): any {
    return runExpect.call(this || {}, toHaveValueFn, args)
}
