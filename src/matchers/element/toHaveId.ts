import { toHaveAttributeAndValue } from './toHaveAttribute.js'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'

export async function toHaveId(
    el: WdioElementMaybePromise,
    expectedValue: string | RegExp | WdioAsymmetricMatcher<string>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    await options.beforeAssertion?.({
        matcherName: 'toHaveId',
        expectedValue,
        options,
    })

    // @ts-ignore TODO dprevost fix me
    const result: ExpectWebdriverIO.AssertionResult = await toHaveAttributeAndValue.call(this, el, 'id', expectedValue, options)

    await options.afterAssertion?.({
        matcherName: 'toHaveId',
        expectedValue,
        options,
        result
    })

    return result
}
