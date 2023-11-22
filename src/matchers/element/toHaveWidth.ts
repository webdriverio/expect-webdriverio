import {
    waitUntil,
    enhanceError,
    executeCommand,
    wrapExpectedWithArray,
    updateElementsArray,
} from '../../utils.js'
import { DEFAULT_OPTIONS } from '../../constants.js'

async function condition(el: WebdriverIO.Element, width: number): Promise<any> {
    const actualWidth = await el.getSize('width')

    return {
        value: actualWidth,
        result: actualWidth === width,
    }
}

export async function toHaveWidth(
    received: WebdriverIO.Element | WebdriverIO.ElementArray,
    expectedValue: number,
    options: ExpectWebdriverIO.CommandOptions = DEFAULT_OPTIONS
) {
    const isNot = this.isNot
    const { expectation = 'width', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveWidth',
        expectedValue,
        options,
    })

    let el = await received
    let actualWidth

    const pass = await waitUntil(
        async () => {
            const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])

            el = result.el
            actualWidth = result.values

            return result.success
        },
        isNot,
        options
    )

    updateElementsArray(pass, received, el)

    const message = enhanceError(
        el,
        wrapExpectedWithArray(el, actualWidth, expectedValue),
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
