import { DEFAULT_OPTIONS } from '../../constants.js'
import {
    compareText, compareTextWithArray,
    enhanceError,
    executeCommand,
    waitUntil,
    wrapExpectedWithArray
} from '../../utils.js'
import type { MaybeArray, WdioElementOrArrayMaybePromise, WdioElements } from '../../types.js'
import { awaitElementOrArray, isArray } from '../../util/elementsUtil.js'

async function condition(el: WebdriverIO.Element | WdioElements, text: MaybeArray<string | RegExp | AsymmetricMatcher<string>>, options: ExpectWebdriverIO.StringOptions) {
    const actualTextArray: string[] = []
    const resultArray: boolean[] = []
    let checkAllValuesMatchCondition: boolean

    if (isArray(el)){
        for (const element of el){
            const actualText = await element.getText()
            actualTextArray.push(actualText)
            const result = Array.isArray(text)
                ? compareTextWithArray(actualText, text, options).result
                : compareText(actualText, text, options).result
            resultArray.push(result)
        }
        checkAllValuesMatchCondition = resultArray.every(Boolean)
    } else {
        const actualText = await el.getText()
        actualTextArray.push(actualText)
        checkAllValuesMatchCondition = Array.isArray(text)
            ? compareTextWithArray(actualText, text, options).result
            : compareText(actualText, text, options).result
    }

    return {
        value: actualTextArray.length === 1 ? actualTextArray[0] : actualTextArray,
        result: checkAllValuesMatchCondition
    }
}

export async function toHaveText(
    received: WdioElementOrArrayMaybePromise,
    expectedValue: MaybeArray<string | RegExp | AsymmetricMatcher<string>>,
    options: ExpectWebdriverIO.StringOptions = DEFAULT_OPTIONS
) {
    const { expectation = 'text', verb = 'have', isNot, matcherName = 'toHaveText' } = this

    await options.beforeAssertion?.({
        matcherName,
        expectedValue,
        options,
    })

    let actualText
    let actualSubject: unknown = received
    const pass = await waitUntil(
        async () => {
            // Calling `awaitElementOrArray` inside the waitUntil so that in non-awaited cases, it couns in the wait time like before!
            // However, now we do await inside the loop on each iteration even in awaited cases, so should we optimize this?
            const { selector, other, isEmptyElements } = await awaitElementOrArray(received)
            actualSubject = selector ?? other
            if (!selector || isEmptyElements) { return false }

            const result = await executeCommand.call(this, selector, condition, options, [expectedValue, options])
            actualSubject = result.el
            actualText = result.values

            return result.success
        },
        isNot,
        { wait: options.wait, interval: options.interval }
    )

    const message = enhanceError(actualSubject, wrapExpectedWithArray(actualSubject, actualText, expectedValue), actualText, this, verb, expectation, '', options)
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
