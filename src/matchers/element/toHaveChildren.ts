import { DEFAULT_OPTIONS } from '../../constants.js'
import type { WdioElementMaybePromise } from '../../types.js'
import {
    compareNumbers,
    enhanceError,
    executeCommand,
    numberError,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, options: ExpectWebdriverIO.NumberOptions) {
    const children = await el.$$('./*').getElements()

    // If no options passed in + children exists
    if (
        typeof options.lte !== 'number' &&
        typeof options.gte !== 'number' &&
        typeof options.eq !== 'number'
    ) {
        return {
            result: children.length > 0,
            value: children?.length
        }
    }

    return {
        result: compareNumbers(children?.length, options),
        value: children?.length
    }
}

export async function toHaveChildren(
    received: WdioElementMaybePromise,
    expectedValue?: number | ExpectWebdriverIO.NumberOptions,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'children', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveChildren',
        expectedValue,
        options,
    })

    const numberOptions: ExpectWebdriverIO.NumberOptions = typeof expectedValue === 'number'
        ? { eq: expectedValue } as ExpectWebdriverIO.NumberOptions
        : expectedValue || {}

    let el = await received?.getElement()
    let children
    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, numberOptions, [numberOptions])
        el = result.el as WebdriverIO.Element
        children = result.values

        return result.success
    }, { ...numberOptions, ...options })

    const error = numberError(numberOptions)
    const expectedArray = wrapExpectedWithArray(el, children, error)
    const message = enhanceError(el, expectedArray, children, this, verb, expectation, '', numberOptions)
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
