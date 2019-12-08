import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

export function toHaveClassContaining(el: WebdriverIO.Element, className: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return runExpect.call(this, toHaveClassContainingFn, arguments)
}

function toHaveClassContainingFn(el: WebdriverIO.Element, className: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttributeFn.call(this, el, 'class', className, {
        ...options,
        containing: true
    })
}
