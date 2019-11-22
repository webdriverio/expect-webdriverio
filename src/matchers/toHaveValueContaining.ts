import { $toHaveValue } from './toHaveValue'

export function $toHaveValueContaining(el: WebdriverIO.Element, value: string, options: ExpectWebdriverIO.StringOptions = {}) {
    return $toHaveValue(el, value, {
        ...options,
        containing: true
    })
}
