import { toHaveElementProperty } from './toHaveElementProperty.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'

export function toHaveValue(
    el: WdioElementOrArrayMaybePromise,
    value: MaybeArray<string | RegExp | WdioAsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    this.matcherName = 'toHaveValue'
    return toHaveElementProperty.call(this, el, 'value', value, options)
}
