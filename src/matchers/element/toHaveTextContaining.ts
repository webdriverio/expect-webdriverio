import { runExpect } from '../../util/expectAdapter'
import { toHaveTextFn } from './toHaveText'

export function toHaveTextContaining(el: WebdriverIO.Element, text: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveTextContainingFn, arguments)
}

function toHaveTextContainingFn(el: WebdriverIO.Element, text: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveTextFn.call(this, el, text, {
        ...options,
        containing: true
    })
}
