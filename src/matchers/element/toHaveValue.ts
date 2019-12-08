import { runExpect } from '../../util/expectAdapter'
import { toHavePropertyFn } from './toHaveProperty'

export function toHaveValue(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveValueFn, arguments)
}

export function toHaveValueFn(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHavePropertyFn.call(this, el, 'value', value, options)
}
