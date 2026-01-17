import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import {
    compareStyle,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, style: { [key: string]: string; }, options: ExpectWebdriverIO.StringOptions) {
    return compareStyle(el, style, options)
}

export async function toHaveStyle(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<{ [key: string]: string; }>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'style', verb = 'have', isNot, matcherName = 'toHaveStyle' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let el
    let actualStyle

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                undefined,
                (elements) => defaultMultipleElementsIterationStrategy(elements, expectedValue, (element, expected) => condition(element, expected, options))
            )
            el = result.elementOrArray
            actualStyle = result.valueOrArray

            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(el, wrapExpectedWithArray(el, actualStyle, expectedValue), actualStyle, this, verb, expectation, '', options)

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
