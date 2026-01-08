import type { RectReturn } from '@wdio/protocols'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { executeCommand, defaultMultipleElementsIterationStrategy } from '../../util/executeCommand.js'
import {
    compareObject,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray,
} from '../../utils.js'

export type Size = Pick<RectReturn, 'width' | 'height'>

async function condition(el: WebdriverIO.Element, size: Size): Promise<{ result: boolean, value: Size }> {
    const actualSize = await el.getSize()

    return compareObject(actualSize, size)
}

export async function toHaveSize(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<Size>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'size', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveSize',
        expectedValue,
        options,
    })

    let el
    let actualSize

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand(received,
                undefined,
                async (elements) => defaultMultipleElementsIterationStrategy(elements, expectedValue, condition)
            )

            el = result.elementOrArray
            actualSize = result.valueOrArray

            return result
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualSize, expectedValue),
        actualSize,
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
        matcherName: 'toHaveSize',
        expectedValue,
        options,
        result
    })

    return result
}
