import {
    waitUntil, enhanceError, compareText, compareTextWithArray, executeCommand,
    wrapExpectedWithArray, updateElementsArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, text: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions) {
    const actualText = await el.getText()
    if (Array.isArray(text)) {
        return compareTextWithArray(actualText, text, options)
    }
    return compareText(actualText, text, options)
}

export async function toHaveText(received: WebdriverIO.Element | WebdriverIO.ElementArray, expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'text', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveText',
        expectedValue,
        options,
    })

    let el = await received
    let actualText

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])
        el = result.el
        actualText = result.values

        return result.success
    }, isNot, options)

    updateElementsArray(pass, received, el)

    const message = enhanceError(el, wrapExpectedWithArray(el, actualText, expectedValue), actualText, this, verb, expectation, '', options)
    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveText',
        expectedValue,
        options,
        result
    })

    return result
}

/**
 * @deprecated
 */
export function toHaveTextContaining(el: WebdriverIO.Element, text: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.StringOptions = {}) {
    return toHaveText.call(this, el, text, {
        ...options,
        containing: true
    })
}
