import { toHaveClass } from './toHaveClass'

export function toHaveClassContaining(el: WebdriverIO.Element, className: string, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveClass(el, className, {
        ...options,
        containing: true
    })
}
