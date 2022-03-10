import { runExpect } from '../../util/expectAdapter'
import { toHaveValueFn } from './toHaveValue'

function toHaveValueContainingFn(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveValueFn.call(this, el, value, {
        ...options,
        containing: true
    })
}

export function toHaveValueContaining(...args: any): any {
    return runExpect.call(this || {}, toHaveValueContainingFn, args)
}
