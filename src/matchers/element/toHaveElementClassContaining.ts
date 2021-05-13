import { runExpect } from '../../util/expectAdapter'
import { toHaveAttributeFn } from './toHaveAttribute'

function toHaveElementClassContainingFn(el: WebdriverIO.Element, className: string, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeFn.call(this, el, 'class', className, {
        ...options,
        containing: true
    })
}

export function toHaveElementClassContaining(...args: any): any {
    return runExpect.call(this, toHaveElementClassContainingFn, args)
}


/**
 * toHaveClass conflicts with Jasmine's https://jasmine.github.io/api/edge/matchers#toHaveClass matcher
 * and will be removed from expect-webdriverio in favor of `toHaveElementClass`
 *
 * toHaveClassContaining is renamed to toHaveElementClassContaining to keep consistency
 */
export function toHaveClassContaining(...args: any): any {
    console.warn('expect(...).toHaveClassContaining is deprecated and will be removed in next release. Use toHaveElementClassContaining instead.')
    return runExpect.call(this, toHaveElementClassContainingFn, args)
}
