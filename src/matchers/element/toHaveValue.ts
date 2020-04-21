import { runExpect } from '../../util/expectAdapter'
import { toHavePropertyFn } from './toHaveProperty'

export function toHaveValueFn(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHavePropertyFn.call(this, el, 'value', value, options)
}

export function toHaveValue(...args: any): any {
    return runExpect.call(this, toHaveValueFn, args)
}
