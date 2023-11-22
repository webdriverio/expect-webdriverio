import {
    waitUntil,
    enhanceError,
    executeCommand,
    wrapExpectedWithArray,
    updateElementsArray,
    compareObject,
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, size: { height: number; width: number }): Promise<any> {
    const actualSize = await el.getSize()

    return compareObject(actualSize, size)
}

export async function toHaveSize(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    expectedValue: { height: number; width: number },
    options: ExpectWebdriverIO.CommandOptions = {}
) {
    const isNot = this.isNot
    const { expectation = 'size', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveSize',
        expectedValue,
        options,
    })

    let el = await received
    let actualSize

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])

            el = result.el
            actualSize = result.values

            return result.success
        },
        isNot,
        options
    )

    updateElementsArray(pass, received, el)

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
        matcherName: 'toHaveSize',
        expectedValue,
        options,
        result
    })

    return result
}
