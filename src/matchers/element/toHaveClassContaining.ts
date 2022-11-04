import { toHaveAttributeAndValueFn } from './toHaveAttribute.js'

export function toHaveElementClassContaining (...args: any) {
    return toHaveClassContaining.call(this, ...args)
}

export function toHaveClassContaining(el: WebdriverIO.Element, className: string | RegExp, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttributeAndValueFn.call(this, el, 'class', className, {
        ...options,
        containing: true
    })
}
