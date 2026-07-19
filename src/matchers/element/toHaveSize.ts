import type { RectReturn } from '@wdio/protocols'
import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementOrArrayMaybePromise } from '../../types.js'
import { executeCommandWithStrategy } from '../../util/executeCommand.js'
import {
    compareObject,
    enhanceError,
    waitUntil,
    wrapExpectedWithArray,
} from '../../utils.js'

export type Size = Pick<RectReturn, 'width' | 'height'>
async function condition(el: WebdriverIO.Element, size: MaybeArray<Size> | undefined): Promise<{ result: boolean, value: Size }> {
    const actualSize = await el.getSize()

    // TODO: Handle array of Size for both single and multiple elements since for now it fails silently.
    return compareObject(actualSize, size)
}

export async function toHaveSize(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<Size>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'size', verb = 'have', isNot, matcherName = 'toHaveSize' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let el
    let actualSize

    const pass = await waitUntil(
        async () => {
            const result = await executeCommandWithStrategy( {
                unresolvedElements: received,
                expectedValues: expectedValue,
                singleElementCompare: (element, expectedSize: MaybeArray<Size> | undefined) => condition(element, expectedSize),
                isNot
            })

            el = result.subject
            actualSize = result.actual

            return result.success
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
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
