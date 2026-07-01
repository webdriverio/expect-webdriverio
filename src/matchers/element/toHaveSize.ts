import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    compareObject,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray,
} from '../../utils.js'
import type { RectReturn } from '@wdio/protocols'

export type Size = Pick<RectReturn, 'width' | 'height'>

async function condition(el: WebdriverIO.Element, size: Partial<Size>) {
    const actualSize = await el.getSize()

    return compareObject(actualSize, size)
}

export async function toHaveSize(
    received: WdioElementMaybePromise,
    expectedValue: Partial<Size>,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const matcherName = 'toHaveSize'
    const { expectation = 'size', verb = 'have', isNot } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let el = await received?.getElement()
    let actualSize: Size | undefined

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])

            el = result.el as WebdriverIO.Element
            actualSize = result.values as Size

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
