import { ExpectWebdriverIO } from '../../types/expect-webdriverio'
import { runExpect } from '../../util/expectAdapter'
import { toHaveValueFn } from './toHaveValue'

function toHaveValueContainingFn(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}, driver?: WebdriverIO.Browser): any {
    return toHaveValueFn.call(this, el, value, {
        ...options,
        containing: true
    }, driver)
}

export function toHaveValueContaining(...args: any): any {
    return runExpect.call(this, toHaveValueContainingFn, args)
}
