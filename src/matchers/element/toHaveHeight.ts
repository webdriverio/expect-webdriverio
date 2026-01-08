import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise, WdioElements } from '../../types.js'
import { wrapExpectedWithArray } from '../../util/elementsUtil.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import { toNumberError, validateNumberOptionsArray } from '../../util/numberOptionsUtil.js'
import {
    compareNumbers,
    enhanceError,
    waitUntil,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expected: ExpectWebdriverIO.NumberOptions) {
    const actualHeight = await el.getSize('height')

    return {
        result: compareNumbers(actualHeight, expected),
        value: actualHeight
    }
}

export async function toHaveHeight(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberOptions>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'height', verb = 'have', matcherName = 'toHaveHeight' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expected = validateNumberOptionsArray(expectedValue)
    // TODO: deprecated NumberOptions as options in favor of ExpectedType and use a third options param only for command options
    const { wait, interval } = Array.isArray(expected) ? {} : expected

    let elements: WebdriverIO.Element | WdioElements | undefined
    let actualHeight: string | number | (string | number | undefined)[] | undefined

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                undefined,
                (elements) => defaultMultipleElementsIterationStrategy(elements, expected, condition))

            elements = result.elementOrArray
            actualHeight = result.valueOrArray

            return result
        },
        { wait: wait ?? options.wait, interval: interval ?? options.interval }
    )

    const expextedFailureMessage = toNumberError(expected)
    const expectedValues = wrapExpectedWithArray(elements, actualHeight, expextedFailureMessage)
    const message = enhanceError(
        elements,
        expectedValues,
        actualHeight,
        this,
        verb,
        expectation,
        '',
        options
    )

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
