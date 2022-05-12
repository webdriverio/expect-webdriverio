import { toHaveAttributeAndValueFn } from './toHaveAttribute'

export function toHaveElementClassContaining(el: WebdriverIO.Element, className: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeAndValueFn.call(this, el, 'class', className, {
        ...options,
        containing: true
    })
}
