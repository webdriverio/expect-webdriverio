import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    compareNumbers,
    enhanceError,
    executeCommand,
    numberError,
    waitUntil,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, width: number, options: ExpectWebdriverIO.NumberOptions) {
    const actualWidth = await el.getSize('width')

    return {
        result: compareNumbers(actualWidth, options),
        value: actualWidth
    }
}

export async function toHaveWidth(
    received: WdioElementMaybePromise,
    expectedValue: number | ExpectWebdriverIO.NumberOptions,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'width', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveWidth',
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
    let actualWidth

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, numberOptions, [expectedValue, numberOptions])

            el = result.el as WebdriverIO.Element
            actualWidth = result.values

            return result.success
        },
        { ...numberOptions, ...options }
    )

    const error = numberError(numberOptions)
    const message = enhanceError(
        el,
        error,
        actualWidth,
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
        matcherName: 'toHaveWidth',
        expectedValue,
        options,
        result
    })

    return result
}
