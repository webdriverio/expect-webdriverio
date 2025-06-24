import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toHaveHref(
    el: WdioElementMaybePromise,
    expectedValue: string,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    await options.beforeAssertion?.({
        matcherName: 'toHaveHref',
        expectedValue,
        options,
    })

    // @ts-ignore TODO dprevost fix me
    const result = await toHaveAttributeAndValue.call(this, el, 'href', expectedValue, options)

    await options.afterAssertion?.({
        matcherName: 'toHaveHref',
        expectedValue,
        options,
        result
    })

    return result
}

export const toHaveLink = toHaveHref
