import { toHaveAttributeAndValue } from './toHaveAttribute.js'

export async function toHaveId(el: WebdriverIO.Element, expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher, options: ExpectWebdriverIO.StringOptions = {}) {
    await options.beforeAssertion?.({
        matcherName: 'toHaveId',
        expectedValue,
        options,
    })

    const result: ExpectWebdriverIO.AssertionResult = await toHaveAttributeAndValue.call(this, el, 'id', expectedValue, options)

    await options.afterAssertion?.({
        matcherName: 'toHaveId',
        expectedValue,
        options,
        result
    })

    return result
}
