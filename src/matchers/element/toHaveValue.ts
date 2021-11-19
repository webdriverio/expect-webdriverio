import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { runExpect } from '../../util/expectAdapter'
import { toHaveElementPropertyFn } from './toHaveElementProperty'

export function toHaveValueFn(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}, driver?: WebdriverIO.Browser): any {
    return toHaveElementPropertyFn.call(this, el, 'value', value, options, driver)
}

export function toHaveValue(...args: any): any {
    return runExpect.call(this, toHaveValueFn, args)
}
