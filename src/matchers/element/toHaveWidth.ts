import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise, WdioElements } from '../../types.js'
import { wrapExpectedWithArray } from '../../util/elementsUtil.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberOptionsArray } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expected: NumberMatcher) {
    const actualWidth = await el.getSize('width')

    return {
        result: expected.equals(actualWidth),
        value: actualWidth
    }
}

export async function toHaveWidth(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberOptions>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'width', verb = 'have', matcherName = 'toHaveWidth', isNot } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { numberMatcher, numberCommandOptions } = validateNumberOptionsArray(expectedValue)

    let elements: WebdriverIO.Element | WdioElements | undefined
    let actualWidth: string | number | (string | number | undefined)[] | undefined

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                undefined,
                (elements) => defaultMultipleElementsIterationStrategy(elements, numberMatcher, condition))

            elements = result.elementOrArray
            actualWidth = result.valueOrArray

            return result
        },
        isNot,
        { wait: numberCommandOptions?.wait ?? options.wait, interval: numberCommandOptions?.interval ?? options.interval }
    )

    const expectedValues = wrapExpectedWithArray(elements, actualWidth, numberMatcher)
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
