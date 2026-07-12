import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareText, compareTextWithArray,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise } from '../../types.js'
import { awaitElementOrArray } from '../../util/elementsUtil.js'

async function condition(el: WebdriverIO.Element, html: MaybeArray<string | RegExp | AsymmetricMatcher<string>>, options: ExpectWebdriverIO.HTMLOptions) {
    const actualHTML = await el.getHTML(options) // TODO: Support for array of elements is coming!
    if (Array.isArray(html)) {
        return compareTextWithArray(actualHTML, html, options)
    }
    return compareText(actualHTML, html, options)
}

export async function toHaveHTML(
    received: WdioElementOrArrayMaybePromise, // TODO: aligning with the signature in expect-webdriverio.d.ts, but array support not yet implemented in the condition function above
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.HTMLOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'HTML', verb = 'have', isNot, matcherName = 'toHaveHTML' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let actualHTML
    let actualSubject: unknown = received
    const pass = await waitUntil(
        async () => {
            const { selector, other, isEmptyElements } = await awaitElementOrArray(received)
            actualSubject = selector ?? other
            if (!selector || isEmptyElements) { return false }

            const result = await executeCommand.call(this, selector, condition, options, [expectedValue, options])
            actualSubject = result.el as WebdriverIO.Element
            actualHTML = result.values

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(actualSubject, wrapExpectedWithArray(actualSubject, actualHTML, expectedValue), actualHTML, this, verb, expectation, '', options)

    const result: ExpectWebdriverIO.AssertionResult = {
        pass,
        message: (): string => message
    }

    await options.afterAssertion?.({
        matcherName,
        expectedValue,
        options,
        result
    })

    return result
}
