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
    const actualHeight = await el.getSize('height')

    return {
        result: expectedNumber.match(actualHeight),
        value: actualHeight
    }
}

export async function toHaveHeight(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberMatcher,
    options?: ExpectWebdriverIO.CommandOptions
):Promise<ExpectWebdriverIO.AssertionResult>

/**
 * deprecated since 5.7.1, remove in 6.0.0. Use `toHaveHeight(received, NumberMatcher, options)` instead.
 */
export async function toHaveHeight(
    received: WdioElementMaybePromise,
    expectedValue: ExpectWebdriverIO.NumberOptions,
    options?: ExpectWebdriverIO.CommandOptions
): Promise<ExpectWebdriverIO.AssertionResult>
export async function toHaveHeight(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions | ExpectWebdriverIO.NumberMatcher,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const matcherName = 'toHaveHeight'
    const { expectation = 'height', verb = 'have', isNot } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    const { numberMatcher: expectedNumber, commandOptions } = validateNumberAndExtractOptions(expectedValue, options)

    let el = await received?.getElement()
    let actualHeight

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, commandOptions, [expectedNumber])

            el = result.el as WebdriverIO.Element
            actualHeight = result.values

            return result.success
        },
        isNot,
        { wait: commandOptions.wait, interval: commandOptions.interval }
    )

    const message = enhanceError(
        el,
        expectedNumber,
        actualHeight,
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
