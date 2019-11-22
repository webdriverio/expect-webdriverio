import { $toHaveAttribute } from './toHaveAttribute'

export function $toHaveClass(el: WebdriverIO.Element, className: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return $toHaveAttribute(el, 'class', className, options)
}
