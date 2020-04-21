import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

function toHaveClassContainingFn(el: WebdriverIO.Element, className: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeFn.call(this, el, 'class', className, {
        ...options,
        containing: true
    })
}

export function toHaveClassContaining(...args: any): any {
    return runExpect.call(this, toHaveClassContainingFn, args)
}
