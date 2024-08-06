import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, height: number) {
    const actualHeight = await el.getSize('height')

    return {
        value: actualHeight,
        result: actualHeight === height,
    }
}

export async function toHaveHeight(
    received: WdioElementMaybePromise,
    expectedValue: number,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'height', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveHeight',
        expectedValue,
        options,
    })

    let el = await received?.getElement()
    let actualHeight

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])

            el = result.el as WebdriverIO.Element
            actualHeight = result.values

            return result.success
        },
        isNot,
        options
    )

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualHeight, expectedValue),
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
        matcherName: 'toHaveHeight',
        expectedValue,
        options,
        result
    })

    return result
}
