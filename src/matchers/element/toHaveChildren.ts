import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import { toNumberError, validateNumberOptionsArray } from '../../util/numberOptionsUtil.js'
import {
    compareNumbers,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, value: ExpectWebdriverIO.NumberOptions) {
    const children = await el.$$('./*').getElements()

    return {
        result: compareNumbers(children?.length, value),
        value: children?.length
    }
}

export async function toHaveChildren(
    received: WdioElementOrArrayMaybePromise,
    expectedValue?: MaybeArray<number | ExpectWebdriverIO.NumberOptions>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'children', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveChildren',
        expectedValue,
        options,
    })

    const numberOptions = validateNumberOptionsArray(expectedValue ?? { gte: 1 })

    // TODO: deprecated NumberOptions as options in favor of ExpectedType and use a third options param only for command options
    const { wait, interval } = !Array.isArray(numberOptions) ? numberOptions : {}

    let el
    let children
    const pass = await waitUntil(async () => {
        const result = await executeCommand(received,
            undefined,
            async (elements) => defaultMultipleElementsIterationStrategy(elements, numberOptions, condition)
        )

        el = result.elementOrArray
        children = result.valueOrArray

        return result
    }, isNot, { wait: wait ?? options.wait, interval: interval ?? options.interval })

    const error = toNumberError(numberOptions)
    const expectedArray = wrapExpectedWithArray(el, children, error)
    const message = enhanceError(el, expectedArray, children, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveChildren',
        expectedValue,
        options,
        result
    })

    return result
}
