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
    const actualWidth = await el.getSize('width')

    return {
        result: compareNumbers(actualWidth, expected),
        value: actualWidth
    }
}

export async function toHaveWidth(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberOptions>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'width', verb = 'have', matcherName = 'toHaveWidth' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const expected = validateNumberOptionsArray(expectedValue)
    // TODO: deprecated NumberOptions as options in favor of ExpectedType and use a third options param only for command options
    const { wait, interval } = Array.isArray(expected) ? {} : expected

    let elements: WebdriverIO.Element | WdioElements | undefined
    let actualWidth: string | number | (string | number | undefined)[] | undefined

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                undefined,
                (elements) => defaultMultipleElementsIterationStrategy(elements, expected, condition))

            elements = result.elementOrArray
            actualWidth = result.valueOrArray

            return result
        },
        isNot,
        { wait: wait ?? options.wait, interval: interval ?? options.interval }
    )

    const expextedFailureMessage = toNumberError(expected)
    const expectedValues = wrapExpectedWithArray(elements, actualWidth, expextedFailureMessage)
    const message = enhanceError(
        elements,
        expectedValues,
        actualWidth,
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
