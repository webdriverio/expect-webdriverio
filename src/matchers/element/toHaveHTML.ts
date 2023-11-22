import {
    waitUntil, enhanceError, compareText, compareTextWithArray, executeCommand,
    wrapExpectedWithArray, updateElementsArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, html: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.HTMLOptions) {
    const actualHTML = await el.getHTML(options.includeSelectorTag)
    if (Array.isArray(html)) {
        return compareTextWithArray(actualHTML, html, options)
    }
    return compareText(actualHTML, html, options)
}

export async function toHaveHTML(received: WebdriverIO.Element | WebdriverIO.ElementArray, expectedValue: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.HTMLOptions = {}) {
    const isNot = this.isNot
    const { expectation = 'HTML', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveHTML',
        expectedValue,
        options,
    })

    let el = await received
    let actualHTML

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])
        el = result.el
        actualHTML = result.values

        return result.success
    }, isNot, options)

    updateElementsArray(pass, received, el)

    const message = enhanceError(el, wrapExpectedWithArray(el, actualHTML, expectedValue), actualHTML, this, verb, expectation, '', options)

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName: 'toHaveHTML',
        expectedValue,
        options,
        result
    })

    return result
}

/**
 * @deprecated
 */
export function toHaveHTMLContaining(el: WebdriverIO.Element, html: string | RegExp | ExpectWebdriverIO.PartialMatcher | Array<string | RegExp>, options: ExpectWebdriverIO.HTMLOptions = {}) {
    return toHaveHTML.call(this, el, html, {
        ...options,
        containing: true
    })
}
