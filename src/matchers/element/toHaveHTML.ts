import type { ChainablePromiseArray, ChainablePromiseElement } from 'webdriverio'

import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareText, compareTextWithArray,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'

async function condition(el: WebdriverIO.Element, html: string | RegExp | WdioAsymmetricMatcher<string> | Array<string | RegExp>, options: ExpectWebdriverIO.HTMLOptions) {
    const actualHTML = await el.getHTML(options)
    if (Array.isArray(html)) {
        return compareTextWithArray(actualHTML, html, options)
    }
    return compareText(actualHTML, html, options)
}

export async function toHaveHTML(
    received: ChainablePromiseArray | ChainablePromiseElement,
    expectedValue: string | RegExp | WdioAsymmetricMatcher<string> | Array<string | RegExp>,
    options: ExpectWebdriverIO.HTMLOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'HTML', verb = 'have' } = this

    await options.beforeAssertion?.({
        matcherName: 'toHaveHTML',
        expectedValue,
        options,
    })

    let el = 'getElement' in received
        ? await received?.getElement()
        : 'getElements' in received
            ? await received?.getElements()
            : received
    let actualHTML

    const pass = await waitUntil(async () => {
        const result = await executeCommand.call(this, el, condition, options, [expectedValue, options])
        el = result.el as WebdriverIO.Element
        actualHTML = result.values

        return result.success
    }, options)

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
