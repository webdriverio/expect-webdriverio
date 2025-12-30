import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    compareNumbers,
    enhanceError,
    executeCommand,
    numberError,
    waitUntil,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, height: number, options: ExpectWebdriverIO.NumberOptions) {
    const actualHeight = await el.getSize('height')

    return {
        result: compareNumbers(actualHeight, options),
        value: actualHeight
    }
}

export async function toHaveHeight(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'height', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveHeight',
        expectedValue,
        options,
    })

    // type check
    let numberOptions: ExpectWebdriverIO.NumberOptions
    if (typeof expectedValue === 'number') {
        numberOptions = { eq: expectedValue } as ExpectWebdriverIO.NumberOptions
    } else if (!expectedValue || (typeof expectedValue.eq !== 'number' && typeof expectedValue.gte !== 'number' && typeof expectedValue.lte !== 'number')) {
        throw new Error('Invalid params passed to toHaveHeight.')
    } else {
        numberOptions = expectedValue
    }

    let el = await received?.getElement()
    let actualHeight

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, numberOptions, [expectedValue, numberOptions])

            el = result.el as WebdriverIO.Element
            actualHeight = result.values

            return result.success
        },
        { ...numberOptions, ...options }
    )

    const error = numberError(numberOptions)
    const message = enhanceError(
        el,
        error,
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
