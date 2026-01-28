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
    const actualHeight = await el.getSize('height')

    return {
        result: expected.equals(actualHeight),
        value: actualHeight
    }
}

export async function toHaveHeight(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<number | ExpectWebdriverIO.NumberOptions>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'height', verb = 'have', matcherName = 'toHaveHeight', isNot } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const {  numberMatcher, numberCommandOptions } = validateNumberOptionsArray(expectedValue)

    let elements: WebdriverIO.Element | WdioElements | undefined
    let actualHeight: string | number | (string | number | undefined)[] | undefined

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                undefined,
                (elements) => defaultMultipleElementsIterationStrategy(elements, numberMatcher, condition))

            elements = result.elementOrArray
            actualHeight = result.valueOrArray

            return result
        },
        isNot,
        { wait: numberCommandOptions?.wait ?? options.wait, interval: numberCommandOptions?.interval ?? options.interval }
    )

    const expectedValues = wrapExpectedWithArray(elements, actualHeight, numberMatcher)
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
