import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { defaultMultipleElementsIterationStrategy, executeCommand } from '../../util/executeCommand.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberOptionsArray } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, value: NumberMatcher) {
    const children = await el.$$('./*').getElements()

    return {
        result: value.equals(children?.length),
        value: children?.length
    }
}

export async function toHaveChildren(
    received: WdioElementOrArrayMaybePromise,
    expectedValue?: MaybeArray<number | ExpectWebdriverIO.NumberOptions>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'children', verb = 'have', matcherName = 'toHaveChildren', isNot } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const  { numberMatcher, numberCommandOptions } = validateNumberOptionsArray(expectedValue ?? { gte: 1 })

    let el
    let children
    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                undefined,
                async (elements) => defaultMultipleElementsIterationStrategy(elements, numberMatcher, condition)
            )

            el = result.elementOrArray
            children = result.valueOrArray

            return result
        },
        isNot,
        { wait: numberCommandOptions?.wait ?? options.wait, interval: numberCommandOptions?.interval ?? options.interval }
    )

    const expectedArray = wrapExpectedWithArray(el, children, numberMatcher)
    const message = enhanceError(el, expectedArray, children, this, verb, expectation, '', { ...numberCommandOptions, ...options })
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
