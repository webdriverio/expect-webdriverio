import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import type { NumberMatcher } from '../../util/numberOptionsUtil.js'
import { validateNumberAndExtractOptions } from '../../util/numberOptionsUtil.js'
import {
    enhanceError,
    executeCommand,
    waitUntil,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, expectedNumber: NumberMatcher) {
    const actualWidth = await el.getSize('width')

    return {
        result: expectedNumber.match(actualWidth),
        value: actualWidth
    }
}

export async function toHaveWidth(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>

/**
 * deprecated since 5.7.1, remove in 6.0.0. Use `toHaveWidth(received, NumberMatcher, options)` instead.
 */
export async function toHaveWidth(
    received: WdioElementMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>

export async function toHaveWidth(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
):Promise<ExpectWebdriverIO.AssertionResult> {
    const { expectation = 'width', verb = 'have', isNot, matcherName = 'toHaveWidth' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberAndExtractOptions(expectedValue, options)

    let el = await received?.getElement()
    let actualWidth

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, commandOptions, [expectedNumber])

            el = result.el as WebdriverIO.Element
            actualWidth = result.values

            return result.success
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    const message = enhanceError(
        el,
        expectedNumber,
        actualWidth,
        this,
        verb,
        expectation,
        '',
        commandOptions,
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
