import { toHaveAttribute } from './toHaveAttribute'

export function toHaveClassContaining(el: WebdriverIO.Element, className: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveAttribute(el, 'class', className, {
        ...options,
        containing: true
    })
}
