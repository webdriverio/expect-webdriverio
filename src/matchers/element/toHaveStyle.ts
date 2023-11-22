import {
    waitUntil, enhanceError, compareStyle, executeCommand, wrapExpectedWithArray,
    updateElementsArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, style: { [key: string]: string; }, options: ExpectWebdriverIO.StringOptions) {
    return compareStyle(el, style, options)
}

export async function toHaveStyle(received: WebdriverIO.Element | WebdriverIO.ElementArray, expectedValue: { [key: string]: string; }, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'style', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveStyle',
        expectedValue,
        options,
    })

    let el = await received
    let actualStyle

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])
        el = result.el
        actualStyle = result.values

        return result.success
    }, isNot, options)

    updateElementsArray(pass, received, el)
    const message = enhanceError(el, wrapExpectedWithArray(el, actualStyle, expectedValue), actualStyle, this, verb, expectation, '', options)

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveStyle',
        expectedValue,
        options,
        result
    })

    return result
}
