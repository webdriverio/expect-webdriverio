import {
    waitUntil, enhanceError, compareNumbers, numberError, executeCommand,
    wrapExpectedWithArray
} from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

async function condition(el: WebdriverIO.Element, options: ExpectWebdriverIO.NumberOptions) {
    const children = await el.$$('./*')

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
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    expectedValue?: number | ExpectWebdriverIO.NumberOptions,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'children', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveChildren',
        expectedValue,
        options,
    })

    const numberOptions: ExpectWebdriverIO.NumberOptions = typeof expectedValue === 'number'
        ? { eq: expectedValue } as ExpectWebdriverIO.NumberOptions
        : expectedValue || {}

    let el = await received
    let children
    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, numberOptions, [numberOptions])
        el = result.el
        children = result.values

        return result.success
    }, isNot, { ...numberOptions, ...options })

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
