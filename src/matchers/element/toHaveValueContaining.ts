import { runExpect } from '../../util/expectAdapter'
import { toHaveValueFn } from './toHaveValue'

export function toHaveValueContaining(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveValueContainingFn, arguments)
}

function toHaveValueContainingFn(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveValueFn.call(this, el, value, {
        ...options,
        containing: true
    })
}
