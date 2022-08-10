import { toHaveAttributeAndValueFn } from './toHaveAttribute'

export function toHaveElementClassContaining (...args: any) {
    return toHaveClassContaining.call(this, ...args)
}

export function toHaveClassContaining(el: WebdriverIO.Element, className: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}): any {
    return toHaveAttributeAndValueFn.call(this, el, 'class', className, {
        ...options,
        containing: true
    })
}
