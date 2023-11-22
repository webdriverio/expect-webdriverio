import {
    waitUntil,
    enhanceError,
    executeCommand,
    wrapExpectedWithArray,
    updateElementsArray,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, height: number): Promise<any> {
    const actualHeight = await el.getSize('height')

    return {
        value: actualHeight,
        result: actualHeight === height,
    }
}

export async function toHaveHeight(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    expectedValue: number,
    options: ExpectWebdriverIO.CommandOptions = {}
) {
    const isNot = this.isNot
    const { expectation = 'height', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveHeight',
        expectedValue,
        options,
    })

    let el = await received
    let actualHeight

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])

            el = result.el
            actualHeight = result.values

            return result.success
        },
        isNot,
        options
    )

    updateElementsArray(pass, received, el)

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
