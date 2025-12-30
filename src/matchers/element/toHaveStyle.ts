import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    compareStyle,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, style: { [key: string]: string; }, options: ExpectWebdriverIO.StringOptions) {
    return compareStyle(el, style, options)
}

export async function toHaveStyle(
    received: WdioElementMaybePromise,
    expectedValue: { [key: string]: string; },
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'style', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveStyle',
        expectedValue,
        options,
    })

    let el = await received?.getElement()
    let actualStyle

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])
        el = result.el as WebdriverIO.Element
        actualStyle = result.values

        return result.success
    }, options)

    const message = enhanceError(el, wrapExpectedWithArray(el, actualStyle, expectedValue), actualStyle, this, verb, expectation, '', options)

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveStyle',
        expectedValue,
        options,
        result
    })

    return result
}
